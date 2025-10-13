import { TokenJWT } from '../servicios/TokenJWT';

const tokenService = new TokenJWT();

export async function authMiddleware(req: any, res: any, next: any) {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Authorization header missing' });
        }

        const parts = String(authHeader).split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ success: false, message: 'Authorization header malformed' });
        }

        const token = parts[1];

        try {
            const payload = await tokenService.verificar(token);
            // Adjuntar payload al request para que los controladores lo usen
            (req as any).user = payload;
            return next();
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
        }
    } catch (error) {
        console.error('Error en authMiddleware:', error);
        return res.status(500).json({ success: false, message: 'Error interno de autenticación' });
    }
}

export default authMiddleware;
