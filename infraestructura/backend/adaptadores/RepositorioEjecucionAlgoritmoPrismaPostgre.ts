import { PrismaClient } from '@prisma/client';
import { RepositorioEjecucionAlgoritmo } from '../../../dominio/RepositorioEjecucionAlgoritmo';
import { EjecucionAlgoritmo } from '../../../dominio/ejecucionAlgoritmo/EjecucionAlgoritmo';
import { EjecucionAlgoritmoId } from '../../../dominio/ejecucionAlgoritmo/objetosValor/EjecucionAlgoritmoId';
import { UsuarioId } from '../../../dominio/usuario/objetosValor/UsuarioId';
import { NombreAlgoritmo } from '../../../dominio/algoritmo/objetosValor/NombreAlgoritmo';
import { TipoAlgoritmo } from '../../../dominio/ejecucionAlgoritmo/objetosValor/TipoAlgoritmo';
import { ValoresEntrada } from '../../../dominio/ejecucionAlgoritmo/objetosValor/ValoresEntrada';
import { VariableSeleccionada } from '../../../dominio/ejecucionAlgoritmo/objetosValor/VariableSeleccionada';
import { FechaEjecucion } from '../../../dominio/ejecucionAlgoritmo/objetosValor/FechaEjecucion';
import { ResultadoEjecucion } from '../../../dominio/ejecucionAlgoritmo/objetosValor/ResultadoEjecucion';
import { TiempoEjecucion } from '../../../dominio/ejecucionAlgoritmo/objetosValor/TiempoEjecucion';

export class RepositorioEjecucionAlgoritmoPrismaPostgre implements RepositorioEjecucionAlgoritmo {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async crearEjecucion(ejecucion: EjecucionAlgoritmo): Promise<void> {
    await this.prisma.ejecucionAlgoritmo.create({ // ← Verificar que coincida con tu schema
      data: {
        usuarioId: ejecucion.usuarioId.value,
        nombreAlgoritmo: ejecucion.nombreAlgoritmo.value,
        tipoAlgoritmo: ejecucion.tipoAlgoritmo.value,
        valoresEntrada: JSON.stringify(ejecucion.valoresEntrada.value),
        variableSeleccionada: ejecucion.variableSeleccionada.value,
        resultado: JSON.stringify(ejecucion.resultado.value), // Sin !
        fechaEjecucion: ejecucion.fechaEjecucion.value,
        tiempoEjecucion: ejecucion.tiempoEjecucion.value // Sin !
      },
    });
  }

  async obtenerEjecuciones(): Promise<EjecucionAlgoritmo[] | null> {
    const ejecuciones = await this.prisma.ejecucionAlgoritmo.findMany({ // ← Verificar que coincida
      orderBy: {
        fechaEjecucion: 'desc'
      }
    });
    
    return ejecuciones.map((ejecucion) => new EjecucionAlgoritmo(
      new EjecucionAlgoritmoId(ejecucion.id),
      new UsuarioId(ejecucion.usuarioId),
      new NombreAlgoritmo(ejecucion.nombreAlgoritmo),
      new TipoAlgoritmo(ejecucion.tipoAlgoritmo as 'predictivo' | 'optimizacion' | 'clasificacion'),
      new ValoresEntrada(JSON.parse(ejecucion.valoresEntrada)),
      new VariableSeleccionada(ejecucion.variableSeleccionada),
      new FechaEjecucion(new Date(ejecucion.fechaEjecucion)),
      new ResultadoEjecucion(JSON.parse(ejecucion.resultado)),
      new TiempoEjecucion(ejecucion.tiempoEjecucion)
    ));
  }
}