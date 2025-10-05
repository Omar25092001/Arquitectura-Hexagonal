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
    private carpetaAlgoritmos: string;

    constructor() {
        this.carpetaAlgoritmos = path.join(__dirname, '../../ModelosML/Entrenamiento/GradientBoostingRegressor/ModelosGradientBoosting');
    }

    async obtenerAlgoritmosPorUsuario(usuarioId: string): Promise<Algoritmo[]> {
        const archivos = fs.readdirSync(this.carpetaAlgoritmos);
        
        const algoritmosUsuario = archivos
            .filter(archivo => archivo.startsWith(`${usuarioId}_`) && archivo.endsWith('.pkl'))
            .map(archivo => {
                const nombreAlgoritmo = archivo.replace(`${usuarioId}_`, '').replace('.pkl', '');
                const rutaCompleta = path.join(this.carpetaAlgoritmos, archivo);
                const stats = fs.statSync(rutaCompleta);

                return new Algoritmo(
                    new AlgoritmoId(archivo),
                    new NombreAlgoritmo(nombreAlgoritmo),
                    new UsuarioId(usuarioId),
                    new RutaArchivo(rutaCompleta),
                    new FechaCreacion(stats.birthtime)
                );
            });

        return algoritmosUsuario;
    }

    async guardarAlgoritmo(algoritmo: Algoritmo): Promise<void> {
        throw new Error('No implementado');
    }

    async eliminarAlgoritmo(algoritmoId: string): Promise<void> {
        const rutaArchivo = path.join(this.carpetaAlgoritmos, algoritmoId);
        if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo);
        } else {
            throw new Error('El algoritmo no existe');
        }
    }
}