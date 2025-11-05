import { EjecutorModeloPython } from '../../infraestructura/backend/adaptadores/EjecutorModeloPython';

export class EjecutarAlgoritmo {
    constructor(private readonly ejecutorML: EjecutorModeloPython) {}

    async run(usuarioId: string, nombreModelo: string, valores: number[], nPasos: number = 7): Promise<any> {
        try {
            console.log(`📊 Ejecutando algoritmo - Usuario: ${usuarioId}, Modelo: ${nombreModelo}`);
            
            // Validaciones básicas
            if (valores.length < 5) {
                throw new Error('Se requieren al menos 5 valores para hacer predicciones');
            }

            //   Usar el ejecutor que detecta automáticamente el tipo
            const resultado = await this.ejecutorML.ejecutar(usuarioId, nombreModelo, valores, { nPasos });
            
            return resultado;
        } catch (error: any) {
            console.error('❌ Error en caso de uso:', error);
            throw new Error(`Error ejecutando algoritmo: ${error.message}`);
        }
    }
}