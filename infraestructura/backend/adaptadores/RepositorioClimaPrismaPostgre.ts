import { PrismaClient } from '@prisma/client';
import { RepositorioClima } from '../../../dominio/RepositorioClima';
import { Clima } from '../../../dominio/clima/Clima';
import { ClimaId } from '../../../dominio/clima/objetosValor/ClimaId';
import { Ciudad } from '../../../dominio/clima/objetosValor/Ciudad';
import { Temperatura } from '../../../dominio/clima/objetosValor/Temperatura';
import { Humedad } from '../../../dominio/clima/objetosValor/Humedad';
import { VelocidadViento } from '../../../dominio/clima/objetosValor/VelocidadViento';
import { Estado } from '../../../dominio/clima/objetosValor/Estado';
import { CreatedAt } from '../../../dominio/clima/objetosValor/CreatedAt';

type climaPrisma = {
  id: number;
  ciudad: string;
  temperatura: number;
  humedad: number;
  velocidadViento: number;
  estado: string;
  createdAt: Date;
};

export class RepositorioClimaPrisma implements RepositorioClima {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }


  async crearClima(clima: Clima): Promise<void> {
    await this.prisma.clima.create({
      data: {  //Mapeamos los valores de la clase Clima (dominio) a los campos de la base de datos
        id: clima.id.value,
        ciudad: clima.ciudad.value,
        temperatura: clima.temperatura.value,
        humedad: clima.humedad.value,
        velocidadViento: clima.velocidadViento.value,
        estado: clima.estado.value,
        createdAt: clima.createdAt.value,
      },
    });
  }

  async obtenerClimas(): Promise<Clima[]> {
    const climas = await this.prisma.clima.findMany();
    //Mapeamos los valores de la base de datos a los objetos de la clase Clima (dominio)
    //El mapeo es necesario porque los objetos de la base de datos no son los mismos que los objetos del dominio
    //ademas mapeando cada uno de ellos se realizaran las validaciones de los objetos de dominio ademas de crearlos
    return climas.map((clima:climaPrisma) => new Clima(
      new ClimaId(clima.id),
      new Ciudad( clima.ciudad),
      new Temperatura(clima.temperatura),
      new Humedad(clima.humedad),
      new VelocidadViento(clima.velocidadViento),
      new Estado(clima.estado),
      new CreatedAt(clima.createdAt)
    ));
  }

  async obtenerClima(id: ClimaId): Promise<Clima | null> {
    const clima = await this.prisma.clima.findUnique({
      where: { id: id.value },
    });
    if (!clima) {
      return null;
    }
    return new Clima(
      new ClimaId(clima.id),
      new Ciudad( clima.ciudad),
      new Temperatura(clima.temperatura),
      new Humedad(clima.humedad),
      new VelocidadViento(clima.velocidadViento),
      new Estado(clima.estado),
      new CreatedAt(clima.createdAt)
    );
  }


  async editarClima(clima: Clima): Promise<void> {
    await this.prisma.clima.update({
      where: { id: clima.id.value },
      data: {
        ciudad: clima.ciudad.value,
        temperatura: clima.temperatura.value,
        humedad: clima.humedad.value,
        velocidadViento: clima.velocidadViento.value,
        estado: clima.estado.value,
        createdAt: clima.createdAt.value,
      },
    });
  }

  async eliminarClima(id: ClimaId): Promise<void> {
    await this.prisma.clima.delete({
      where: { id: id.value },
    });
  }

}