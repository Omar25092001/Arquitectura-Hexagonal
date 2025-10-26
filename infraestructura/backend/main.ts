import express, { NextFunction,Request,Response } from 'express';
import {ExpressUsuarioRouter} from './routes/ExpressUsuarioRouter';
import {ExpressAlgoritmoRouter} from './routes/ExpressAlgoritmoRouter';
import ExpressEjecucionAlgoritmoRouter from './routes/ExpressEjecucionAlgoritmoRouter';
import { xmiRouter } from './routes/xmi.routes';
import cors from 'cors';
import { ServiceContainer } from '../../Shared/infraestructura/ServiceContainer';
import { randomUUID } from 'crypto';
import { CorreoDuplicado } from '../../dominio/usuario/erroresDominio/CorreoDuplicado';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());


app.use('/api/usuarios', ExpressUsuarioRouter);
app.use('/api/algoritmos', ExpressAlgoritmoRouter);
app.use('/api/ejecuciones', ExpressEjecucionAlgoritmoRouter);
app.use('/api/xmi', xmiRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send(err.message);
    } else {
        console.error(err);
        res.status(500).send('Algo salió mal!');
    }
});


// Inicia el servidor
// Crea (de forma idempotente) un usuario admin al iniciar el backend
async function ensureAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPass = process.env.ADMIN_PASS || 'Admin25*';
    const adminName = process.env.ADMIN_NAME || 'Administrador';
    try {
        await ServiceContainer.usuario.crearUsuario.run(
            randomUUID(),
            adminName,
            adminEmail,
            true, // estado
            adminPass,
            false, // primeraVez: false para no mostrar onboarding al admin
            new Date(),
            new Date()
        );
        console.log('Usuario admin creado:', adminEmail);
    } catch (err: unknown) {
        if (err instanceof CorreoDuplicado) {
            console.log('Usuario admin ya existe:', adminEmail);
        } else {
            console.error('Error creando usuario admin:', err);
        }
    }
}

ensureAdminUser().then(() => {
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Error durante la inicialización:', err);
    process.exit(1);
});