import jwt from 'jsonwebtoken';
import { Token } from '../../../dominio/usuario/servicios/Token';
import { Usuario } from '../../../dominio/usuario/Usuario';

export class TokenJWT implements Token {
    private readonly secretKey: string;

    constructor() {
        this.secretKey = process.env.JWT_SECRET || 'tu-clave-secreta-jwt';
    }

    async generar(usuario: Usuario): Promise<string> {
        const payload = {
            id: usuario.id.value,
            correo: usuario.correo.value,
            nombre: usuario.nombre.value
        };

        return jwt.sign(payload, this.secretKey, {
            expiresIn: '24h' 
        });
    }

    async verificar(token: string): Promise<any> {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    decodificar(token: string): any {
        return jwt.decode(token);
    }
}