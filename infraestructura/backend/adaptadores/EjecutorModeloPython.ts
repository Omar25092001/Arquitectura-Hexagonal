import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export class EjecutorModeloPython {
    private rutaScript: string;
    private directorioScript: string;

    constructor() {
        this.rutaScript = path.join(__dirname, '../../ModelosML/Prediccion/predictor.py');
        this.directorioScript = path.dirname(this.rutaScript);
        
        if (!fs.existsSync(this.rutaScript)) {
            throw new Error(`Script no encontrado: ${this.rutaScript}`);
        }
    }

    async ejecutar(nombreModelo: string, valores: number[]): Promise<any> {
        try {
            const valoresJson = JSON.stringify(valores);
            
            // En Windows, escapar las comillas dobles correctamente
            const valoresEscapados = valoresJson.replace(/"/g, '\\"');
            
            // Usar comillas dobles para todo el argumento
            const comando = `python "${this.rutaScript}" "${nombreModelo}" "${valoresEscapados}"`;
            
            console.log('📂 Directorio de trabajo:', this.directorioScript);
            console.log('🚀 Ejecutando comando:', comando);
            
            const { stdout, stderr } = await execPromise(comando, {
                cwd: this.directorioScript,
                encoding: 'utf8'
            });

            console.log('✅ STDOUT:', stdout);
            if (stderr) {
                console.log('⚠️ STDERR:', stderr);
            }

            const lineas = stdout.trim().split('\n');
            const ultimaLinea = lineas[lineas.length - 1];
            
            const resultado = JSON.parse(ultimaLinea);
            
            if (!resultado.success) {
                throw new Error(resultado.error || 'Error desconocido');
            }

            return resultado;
        } catch (error: any) {
            console.error('❌ Error completo:', error);
            throw new Error(`Error al ejecutar el modelo: ${error.message}`);
        }
    }
}