import { EjecutorModeloPython } from '../../infraestructura/backend/adaptadores/EjecutorModeloPython';

export class EjecutarAlgoritmo {
    constructor(private ejecutorModelo: EjecutorModeloPython) {}

    async run(nombreModelo: string, valores: number[]): Promise<any> {
        if (!nombreModelo || nombreModelo.trim() === '') {
            throw new Error('El nombre del modelo es requerido');
        }

        if (!valores || valores.length < 5) {
            throw new Error('Se necesitan al menos 5 valores');
        }

        return await this.ejecutorModelo.ejecutar(nombreModelo, valores);
    }
}