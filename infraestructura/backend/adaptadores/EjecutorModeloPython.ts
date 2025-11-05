import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export class EjecutorModeloPython {
    private directorioBase: string;

    constructor() {
        this.directorioBase = path.join(__dirname, '../../ModelosML');
    }

    private detectarTipoModelo(usuarioId: string, nombreModelo: string): { tipo: string, script: string } | null {
        const tiposModelos = [
            {
                tipo: 'predictivo',
                carpeta: path.join(this.directorioBase, 'Prediccion', 'ModelosPredictivos'),
                script: path.join(this.directorioBase, 'Prediccion', 'predictor.py'),
                sufijo: '_predictivo.pkl'
            }
            //   Eliminamos optimización y clasificación ya que no tienen modelos
        ];

        for (const config of tiposModelos) {
            const nombreArchivo = `${usuarioId}_${nombreModelo}${config.sufijo}`;
            const rutaModelo = path.join(config.carpeta, nombreArchivo);

            console.log(`Buscando modelo ${config.tipo}: ${rutaModelo}`);

            if (fs.existsSync(rutaModelo)) {
                console.log(`Modelo encontrado como tipo: ${config.tipo}`);
                return {
                    tipo: config.tipo,
                    script: config.script
                };
            }
        }

        // Si no encontramos modelo predictivo, verificar si piden optimización o clasificación
        const scriptOptimizacion = path.join(this.directorioBase, 'Optimizacion', 'optimizador.py');
        const scriptClasificacion = path.join(this.directorioBase, 'Clasificacion', 'clasificador.py');

        // Si el nombre del modelo sugiere optimización
        if (nombreModelo.toLowerCase().includes('optimiz') && fs.existsSync(scriptOptimizacion)) {
            console.log(`Detectado como optimización por nombre: ${nombreModelo}`);
            return {
                tipo: 'optimizacion',
                script: scriptOptimizacion
            };
        }

        // Si el nombre del modelo sugiere clasificación
        if (nombreModelo.toLowerCase().includes('clasific') && fs.existsSync(scriptClasificacion)) {
            console.log(`Detectado como clasificación por nombre: ${nombreModelo}`);
            return {
                tipo: 'clasificacion',
                script: scriptClasificacion
            };
        }

        console.log(`No se encontro el modelo ${usuarioId}_${nombreModelo} en ningun tipo`);
        return null;
    }


    async ejecutar(usuarioId: string, nombreModelo: string, valores: number[], parametrosExtra?: any): Promise<any> {
        try {
            console.log(`Ejecutando modelo - Usuario: ${usuarioId}, Modelo: ${nombreModelo}`);

            const configuracion = this.detectarTipoModelo(usuarioId, nombreModelo);

            if (!configuracion) {
                throw new Error(`Modelo '${nombreModelo}' no encontrado para el usuario '${usuarioId}'. Tipos buscados: predictivo, optimizacion, clasificacion`);
            }

        
            if (!fs.existsSync(configuracion.script)) {
                throw new Error(`Script no encontrado: ${configuracion.script}`);
            }

            const valoresJson = JSON.stringify(valores);
            const valoresEscapados = valoresJson.replace(/"/g, '\\"');

            let comando = `python "${configuracion.script}" "${usuarioId}" "${nombreModelo}" "${valoresEscapados}"`;

            if (configuracion.tipo === 'predictivo' && parametrosExtra?.nPasos) {
                comando += ` ${parametrosExtra.nPasos}`;
            }


            const directorioTrabajo = path.dirname(configuracion.script);
            const { stdout, stderr } = await execPromise(comando, {
                cwd: directorioTrabajo,
                encoding: 'utf8'
            });

            if (stderr) {
                console.log('STDERR:', stderr);
            }

            const lineas = stdout.trim().split('\n');
            const ultimaLinea = lineas[lineas.length - 1];

            const resultado = JSON.parse(ultimaLinea);

            if (!resultado.success) {
                throw new Error(resultado.error || 'Error desconocido');
            }

            resultado.tipoDetectado = configuracion.tipo;
            resultado.scriptEjecutado = configuracion.script;

            return resultado;
        } catch (error: any) {
            console.error('Error completo:', error);
            throw new Error(`Error al ejecutar el modelo: ${error.message}`);
        }
    }

    async predecir(usuarioId: string, nombreModelo: string, valores: number[], nPasos: number ): Promise<any> {
        return await this.ejecutar(usuarioId, nombreModelo, valores, { nPasos });
    }
}