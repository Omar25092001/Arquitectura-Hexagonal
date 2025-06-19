import express, { NextFunction,Request,Response } from 'express';
import {ExpressClimaRouter} from './routes/ExpressClimaRouter';
import {ExpressUsuarioRouter} from './routes/ExpressUsuarioRouter';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());


app.use(ExpressClimaRouter);
app.use('/api/usuarios', ExpressUsuarioRouter);


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
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});