// src/infraestructura/backend/adaptadores/RepositorioUsuarioInflux.ts

import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { RepositorioUsuario } from '../../../dominio/RepositorioUsuario';
import { Usuario } from '../../../dominio/usuario/Usuario';
import { UsuarioId } from '../../../dominio/usuario/objetosValor/UsuarioId';
import { Nombre } from '../../../dominio/usuario/objetosValor/Nombre';
import { Correo } from '../../../dominio/usuario/objetosValor/Correo';
import { Contrasena } from '../../../dominio/usuario/objetosValor/Constrasena';
import { CreatedAt } from '../../../dominio/usuario/objetosValor/CreatedAt';
import { UpdatedAt } from '../../../dominio/usuario/objetosValor/UpdatedAt';

// Define el tipo para los registros de InfluxDB
type usuarioInflux = {
    id: string;  // InfluxDB devolverá el ID como string
    nombre: string;
    correo: string;
    contrasena: string;
    _time: string;  // Campo específico de InfluxDB para el timestamp
};

export class RepositorioUsuarioInflux implements RepositorioUsuario {
    private client: InfluxDB;
    private org: string;
    private bucket: string;

    constructor() {
        const token = process.env.INFLUXDB_TOKEN;
        const url = 'http://localhost:8086';
        this.org = process.env.INFLUXDB_ORG || 'miOrg';
        this.bucket = process.env.INFLUXDB_BUCKET || 'digital_twin';

        this.client = new InfluxDB({ url, token });
    }

    async crearUsuario(usuario: Usuario): Promise<void> {
        const writeApi = this.client.getWriteApi(this.org, this.bucket);
        writeApi.useDefaultTags({ host: 'host1' });

        const point = new Point('usuario')
            .tag('id', usuario.id.value.toString())  // Convertir ID numérico a string
            .stringField('nombre', usuario.nombre.value)
            .stringField('correo', usuario.correo.value)
            .stringField('contrasena', usuario.contrasena.value)
            .timestamp(usuario.createdAt.value);

        writeApi.writePoint(point);
        await writeApi.close();
    }

    async obtenerUsuarios(): Promise<Usuario[] | null> {
        const queryApi = this.client.getQueryApi(this.org);

        const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -100y)
        |> filter(fn: (r) => r._measurement == "usuario")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> filter(fn: (r) => exists r.id and exists r.nombre and exists r.correo and exists r.contrasena)
        |> yield(name: "usuarios")
    `;

        try {
            const result: Usuario[] = [];
            const records = await queryApi.collectRows<usuarioInflux>(fluxQuery);

            if (records.length === 0) {
                return null;
            }

            for (const record of records) {
                const usuario = new Usuario(
                    new UsuarioId(parseInt(record.id, 10)),  // Convertir ID string a número
                    new Nombre(record.nombre),
                    new Correo(record.correo),
                    new Contrasena(record.contrasena),
                    new CreatedAt(new Date(record._time)),
                    new UpdatedAt(new Date())
                );
                result.push(usuario);
            }

            return result;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return null;
        }
    }

    async obtenerUsuario(id: UsuarioId): Promise<Usuario | null> {
        const queryApi = this.client.getQueryApi(this.org);

        const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -100y)
        |> filter(fn: (r) => r._measurement == "usuario" and r.id == "${id.value.toString()}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> filter(fn: (r) => exists r.id and exists r.nombre and exists r.correo and exists r.contrasena)
        |> first()
        |> yield(name: "usuario")
    `;

        try {
            const records = await queryApi.collectRows<usuarioInflux>(fluxQuery);

            if (records.length === 0) {
                return null;
            }

            const record = records[0];

            return new Usuario(
                new UsuarioId(parseInt(record.id, 10)),  // Convertir ID string a número
                new Nombre(record.nombre),
                new Correo(record.correo),
                new Contrasena(record.contrasena),
                new CreatedAt(new Date(record._time)),
                new UpdatedAt(new Date())
            );
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return null;
        }
    }

    async obtenerUsuarioPorCorreo(correo: Correo): Promise<Usuario | null> {
        const queryApi = this.client.getQueryApi(this.org);

        // --- PASO 1: Encontrar el ID del usuario que coincide con el correo ---
        // Esta consulta es simple y busca en el campo (_field) "correo" el valor (_value) que coincida.
        const findIdQuery = `
            from(bucket: "${this.bucket}")
            |> range(start: -100y)
            |> filter(fn: (r) => r._measurement == "usuario" and r._field == "correo" and r._value == "${correo.value}")
            |> last()
            |> keep(columns: ["id"])
        `;

        try {
            console.log("Ejecutando con InfluxDB:");
            const idRecords = await queryApi.collectRows<{ id: string }>(findIdQuery);

            if (idRecords.length === 0) {
                // No se encontró ningún usuario con ese correo.
                return null;
            }

            const userId = idRecords[0].id;

            // --- PASO 2: Obtener todos los campos para el usuario con el ID encontrado ---
            // Esta consulta es una búsqueda simple por el tag "id".
            const fetchUserQuery = `
            from(bucket: "${this.bucket}")
                |> range(start: -100y)
                |> filter(fn: (r) => r._measurement == "usuario" and r.id == "${userId}")
                |> last()
            `;

            const userFieldRecords = await queryApi.collectRows<{ _field: string, _value: any, _time: string }>(fetchUserQuery);

            if (userFieldRecords.length === 0) {
                return null;
            }

            // --- PASO 3: Reconstruir el objeto Usuario a partir de sus campos ---
            const userData: Record<string, any> = {};
            userFieldRecords.forEach(record => {
                userData[record._field] = record._value;
            });

            // Asegurarse de que los campos esenciales existen
            if (!userData.correo || !userData.contrasena || !userData.nombre) {
                console.error("Datos del usuario incompletos en la base de datos para el ID:", userId);
                return null;
            }

            return new Usuario(
                new UsuarioId(parseInt(userId, 10)),
                new Nombre(userData.nombre),
                new Correo(userData.correo),
                new Contrasena(userData.contrasena),
                new CreatedAt(new Date(userFieldRecords[0]._time)), // Usamos el timestamp del primer campo encontrado
                new UpdatedAt(new Date(userFieldRecords[0]._time))
            );

        } catch (error) {
            console.error('Error al obtener usuario por correo:', error);
          
            return null;
        }
    }


    async editarUsuario(usuario: Usuario): Promise<void> {
        const writeApi = this.client.getWriteApi(this.org, this.bucket);
        writeApi.useDefaultTags({ host: 'host1' });

        const deletePoint = new Point('usuario_deleted')
            .tag('id', usuario.id.value.toString())  // Convertir ID numérico a string
            .timestamp(new Date());

        const updatePoint = new Point('usuario')
            .tag('id', usuario.id.value.toString())  // Convertir ID numérico a string
            .stringField('nombre', usuario.nombre.value)
            .stringField('correo', usuario.correo.value)
            .stringField('contrasena', usuario.contrasena.value)
            .timestamp(usuario.updatedAt.value);

        writeApi.writePoint(deletePoint);
        writeApi.writePoint(updatePoint);
        await writeApi.close();
    }

    async eliminarUsuario(id: UsuarioId): Promise<void> {
        const writeApi = this.client.getWriteApi(this.org, this.bucket);
        writeApi.useDefaultTags({ host: 'host1' });

        const point = new Point('usuario_deleted')
            .tag('id', id.value.toString())  // Convertir ID numérico a string
            .timestamp(new Date());

        writeApi.writePoint(point);
        await writeApi.close();
    }

    async verificarContrasena(usuario: Usuario, contrasena: Contrasena): Promise<boolean> {
        return usuario.contrasena.value === contrasena.value;
    }
}