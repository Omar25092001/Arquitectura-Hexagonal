import bcrypt from 'bcrypt';
import { Hasheo } from '../../../dominio/usuario/servicios/Hasheo';
import { Contrasena } from '../../../dominio/usuario/objetosValor/Constrasena';
export class HasheBcrypt implements Hasheo {
    private readonly saltRounds = 10;

    async hashear(contrasena: Contrasena): Promise<string> { 
        return await bcrypt.hash(contrasena.value, this.saltRounds); 
    }

    async verificar(contrasenaPlana: string, contrasenaHasheada: string): Promise<boolean> {
        return await bcrypt.compare(contrasenaPlana, contrasenaHasheada);
    }
}