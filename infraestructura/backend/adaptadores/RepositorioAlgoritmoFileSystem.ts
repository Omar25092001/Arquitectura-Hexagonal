import { RepositorioAlgoritmo } from '../../../dominio/RepositorioAlgoritmo';
import { Algoritmo } from '../../../dominio/algoritmo/Algoritmo';
import { AlgoritmoId } from '../../../dominio/algoritmo/objetosValor/AlgoritmoId';
import { NombreAlgoritmo } from '../../../dominio/algoritmo/objetosValor/NombreAlgoritmo';
import { UsuarioId } from '../../../dominio/usuario/objetosValor/UsuarioId';
import { RutaArchivo } from '../../../dominio/algoritmo/objetosValor/RutaArchivo';
import { FechaCreacion } from '../../../dominio/algoritmo/objetosValor/FechaCreacion';
import fs from 'fs';
import path from 'path';

export class RepositorioAlgoritmoFileSystem implements RepositorioAlgoritmo {
    private directorioBase: string;

    constructor() {
        this.directorioBase = path.join(__dirname, '../../ModelosML');
    }

    async obtenerAlgoritmosPorUsuario(usuarioId: string): Promise<Algoritmo[]> {
        const algoritmos: Algoritmo[] = [];
        
        // ✅ Carpetas donde buscar modelos
        const carpetasModelos = [
            { 
                tipo: 'Predictivo', 
                carpeta: path.join(this.directorioBase, 'Prediccion', 'ModelosPredictivos'),
                sufijo: '_predictivo.pkl'
            },
            { 
                tipo: 'Optimización', 
                carpeta: path.join(this.directorioBase, 'Optimizacion', 'ModelosOptimizacion'),
                sufijo: '_optimizacion.pkl'
            },
            { 
                tipo: 'Clasificación', 
                carpeta: path.join(this.directorioBase, 'Clasificacion', 'ModelosClasificacion'),
                sufijo: '_clasificacion.pkl'
            }
        ];

        console.log(`Buscando algoritmos para usuario: ${usuarioId}`);

        // ✅ Buscar en cada carpeta
        for (const { tipo, carpeta, sufijo } of carpetasModelos) {
            console.log(`Explorando carpeta ${tipo}: ${carpeta}`);
            
            if (fs.existsSync(carpeta)) {
                try {
                    const archivos = fs.readdirSync(carpeta);
                    console.log(`Archivos encontrados en ${tipo}:`, archivos);
                    
                    const algoritmosEnCarpeta = archivos
                        .filter(archivo => archivo.startsWith(`${usuarioId}_`) && archivo.endsWith(sufijo))
                        .map(archivo => {
                            // ✅ Extraer nombre limpio
                            let nombreAlgoritmo = archivo.replace(`${usuarioId}_`, '').replace('.pkl', '');
                            
                            // Remover sufijos específicos
                            if (sufijo === '_predictivo.pkl') {
                                nombreAlgoritmo = nombreAlgoritmo.replace('_predictivo', '');
                            } else if (sufijo === '_optimizacion.pkl') {
                                nombreAlgoritmo = nombreAlgoritmo.replace('_optimizacion', '');
                            } else if (sufijo === '_clasificacion.pkl') {
                                nombreAlgoritmo = nombreAlgoritmo.replace('_clasificacion', '');
                            }

                            const rutaCompleta = path.join(carpeta, archivo);
                            const stats = fs.statSync(rutaCompleta);

                            return new Algoritmo(
                                new AlgoritmoId(archivo),
                                new NombreAlgoritmo(`[${tipo}] ${nombreAlgoritmo}`),
                                new UsuarioId(usuarioId),
                                new RutaArchivo(rutaCompleta),
                                new FechaCreacion(stats.birthtime)
                            );
                        });

                    console.log(`Algoritmos encontrados en ${tipo}:`, algoritmosEnCarpeta.length);
                    algoritmos.push(...algoritmosEnCarpeta);
                } catch (error) {
                    console.error(`Error leyendo carpeta ${carpeta}:`, error);
                }
            } else {
                console.log(`Carpeta no existe: ${carpeta}`);
            }
        }

        console.log(`Total algoritmos encontrados para ${usuarioId}:`, algoritmos.length);
        return algoritmos;
    }

    async guardarAlgoritmo(algoritmo: Algoritmo): Promise<void> {
        throw new Error('No implementado');
    }

    async eliminarAlgoritmo(algoritmoId: string): Promise<void> {
        const carpetasModelos = [
            path.join(this.directorioBase, 'Prediccion', 'ModelosPredictivos'),
            path.join(this.directorioBase, 'Optimizacion', 'ModelosOptimizacion'),
            path.join(this.directorioBase, 'Clasificacion', 'ModelosClasificacion')
        ];

        let encontrado = false;

        for (const carpeta of carpetasModelos) {
            const rutaArchivo = path.join(carpeta, algoritmoId);
            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo);
                encontrado = true;
                console.log(`Algoritmo eliminado: ${rutaArchivo}`);
                break;
            }
        }

        if (!encontrado) {
            throw new Error(`El algoritmo ${algoritmoId} no existe`);
        }
    }
}