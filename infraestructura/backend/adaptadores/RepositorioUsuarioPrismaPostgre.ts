import { PrismaClient } from '@prisma/client';
import { RepositorioUsuario } from '../../../dominio/RepositorioUsuario';
import { Usuario } from '../../../dominio/usuario/Usuario';
import { UsuarioId } from '../../../dominio/usuario/objetosValor/UsuarioId';
import { Nombre } from '../../../dominio/usuario/objetosValor/Nombre';
import { Correo } from '../../../dominio/usuario/objetosValor/Correo';
import { Estado } from '../../../dominio/usuario/objetosValor/Estado';
import { Contrasena } from '../../../dominio/usuario/objetosValor/Constrasena';
import { CreatedAt } from '../../../dominio/usuario/objetosValor/CreatedAt';
import { UpdatedAt } from '../../../dominio/usuario/objetosValor/UpdatedAt';

// Actualiza el tipo para que coincida con la estructura real de Prisma


export class RepositorioUsuarioPrismaPostgre implements RepositorioUsuario {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async crearUsuario(usuario: Usuario): Promise<void> {
    await this.prisma.usuario.create({
      data: {
        // Asegúrate de que los campos coincidan con tu esquema de Prisma
        id: usuario.id.value,
        nombre: usuario.nombre.value,
        correo: usuario.correo.value,
        contrasena: usuario.contrasena.value,
        estado: true, // Asegúrate de incluir el estado
        // No es necesario especificar fechaCreacion y fechaActualizacion
        // ya que tienen valores por defecto en el esquema
      },
    });
  }

  async obtenerUsuarios(): Promise<Usuario[] | null> {
    const usuarios = await this.prisma.usuario.findMany();
    
    // Usa el tipo correcto en el mapeo
    return usuarios.map((usuario) => new Usuario(
      new UsuarioId(usuario.id),
      new Nombre(usuario.nombre),
      new Correo(usuario.correo),
      new Estado(usuario.estado), 
      new Contrasena(usuario.contrasena),
      new CreatedAt(usuario.fechaCreacion),
      new UpdatedAt(usuario.fechaActualizacion)
    ));
  }

  async obtenerUsuario(id: UsuarioId): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: id.value },
    });
    if (!usuario) {
      return null;
    }
    return new Usuario(
      new UsuarioId(usuario.id),
      new Nombre(usuario.nombre),
      new Correo(usuario.correo),
      new Estado(usuario.estado),
      new Contrasena(usuario.contrasena),
      new CreatedAt(usuario.fechaCreacion),
      new UpdatedAt(usuario.fechaActualizacion)
    );
  }

  async obtenerUsuarioPorCorreo(correo: Correo): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { correo: correo.value },
    });
    if (!usuario) {
      return null;
    }
    return new Usuario(
      new UsuarioId(usuario.id),
      new Nombre(usuario.nombre),
      new Correo(usuario.correo),
      new Estado(usuario.estado),
      new Contrasena(usuario.contrasena),
      new CreatedAt(usuario.fechaCreacion),
      new UpdatedAt(usuario.fechaActualizacion)
    );
  }

  async editarEstadoUsuario(id: UsuarioId, estado: Estado, updatedAt: UpdatedAt): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: id.value },
      data: {
        estado: estado.value,
        fechaActualizacion: updatedAt.value
      },
    });
  }

  async editarUsuario(usuario: Usuario): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: usuario.id.value },
      data: {
        nombre: usuario.nombre.value,
        correo: usuario.correo.value,
        estado: usuario.estado.value,
        contrasena: usuario.contrasena.value,
        // fechaActualizacion se actualiza automáticamente
      },
    });
  }

  async eliminarUsuario(id: UsuarioId): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id: id.value },
    });
  }

}