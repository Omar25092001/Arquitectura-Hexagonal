import { Users, Eye, ToggleLeft, ToggleRight, ClipboardCopy } from 'lucide-react';

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    fechaRegistro: string;
    ultimoAcceso: string;
    estado: true | false;
}

interface ListaUsuariosProps {
    usuarios: Usuario[];
    searchTerm?: string;
    onVerUsuario?: (usuario: Usuario) => void;
    onCambiarEstado: (id: number) => void;
}

export default function ListaUsuarios({
    usuarios,
    searchTerm = '',
    onVerUsuario,
    onCambiarEstado,
}: ListaUsuariosProps) {

    // Filtrar usuarios basado en la búsqueda
    const usuariosFiltrados = usuarios
        .filter(usuario => usuario.email !== 'admin@gmail.com')
        .filter(usuario => {
            if (!searchTerm) return true;
            const matchNombre = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchEmail = usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchNombre || matchEmail;
        });

    const shortenId = (id: string, chars = 4) => {
        if (typeof id !== 'string') return '';
        return `${id.substring(0, chars)}...${id.substring(id.length - chars)}`;
    };

    const handleCopy = (id: number | string) => {
        navigator.clipboard.writeText(String(id));
    };

    return (
        <div className="bg-secundary rounded-xl">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    Lista de Usuarios ({usuariosFiltrados.length})
                </h2>
            </div>

            <div className="overflow-x-auto">
                {/*   MODIFICADO: Quitamos 'table-fixed' para que los anchos sean automáticos */}
                <table className="w-full">
                    <thead className="bg-background">
                        <tr className="border-b border-gray-700">
                            {/*   MODIFICADO: Oculto en móvil (hidden), visible en mediano (md:table-cell) */}
                            <th className="text-left text-gray-300 p-4 w-40 hidden md:table-cell">ID</th>
                            
                            <th className="text-left text-gray-300 p-4">Nombre</th>
                            
                            {/*   MODIFICADO: Oculto en móvil (hidden), visible en pequeño (sm:table-cell) */}
                            <th className="text-left text-gray-300 p-4 hidden sm:table-cell">Email</th>
                            
                            {/*   MODIFICADO: Oculto en móvil (hidden), visible en grande (lg:table-cell) */}
                            <th className="text-left text-gray-300 p-4 w-32 hidden lg:table-cell">Registro</th>
                            
                            <th className="text-left text-gray-300 p-4 w-28">Estado</th>
                            <th className="text-center text-gray-300 p-4 w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map((usuario) => (
                            <tr key={usuario.id} className="border-b border-gray-700 hover:bg-label transition-colors">
                                
                                {/*   MODIFICADO: Oculto en móvil (hidden), visible en mediano (md:table-cell) */}
                                <td className="p-4 hidden md:table-cell">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className="text-gray-400 font-mono text-sm"
                                            title={String(usuario.id)}
                                        >
                                            {shortenId(String(usuario.id), 6)}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(usuario.id)}
                                            title="Copiar ID completo"
                                            className="p-1 text-gray-500 hover:text-orange-400 hover:bg-background rounded"
                                        >
                                            <ClipboardCopy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                                            {usuario.nombre.charAt(0).toUpperCase()}
                                        </div>
                                      {/*   MODIFICADO: Añadido 'truncate' para evitar que el texto largo se desborde */}
                                        <span className="text-white font-medium truncate">{usuario.nombre}</span>
                                    </div>
                                </td>
                                
                                {/*   MODIFICADO: Oculto en móvil (hidden), visible en pequeño (sm:table-cell) */}
                                <td className="p-4 hidden sm:table-cell">
                                    {/*   MODIFICADO: Añadido 'truncate' */}
                                    <span className="text-gray-300 truncate">{usuario.email}</span>
                                </td>
                                
                            {/*   MODIFICADO: Oculto en móvil (hidden), visible en grande (lg:table-cell) */}
                                <td className="p-4 hidden lg:table-cell">
                                    <span className="text-gray-300">{usuario.fechaRegistro}</span>
                                </td>
                                
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${usuario.estado === true
                                        ? 'bg-green-600 bg-opacity-30 text-green-300'
                                        : 'bg-red-600 bg-opacity-30 text-red-300'
                                        }`}>
                                        {usuario.estado === true ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        {onVerUsuario && (
                                            <button
                                                onClick={() => onVerUsuario(usuario)}
                                                className="p-2 text-blue-400 hover:bg-blue-400 hover:bg-opacity-20 rounded-lg transition-colors"
                                                title="Ver detalles"
                                            >
                                          <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                     onClick={() => onCambiarEstado(usuario.id)}
                                            className={`p-2 rounded-lg transition-colors ${usuario.estado === true
                                           ? 'text-red-400 hover:bg-red-400 hover:bg-opacity-20 hover:text-white'
                                                : 'text-green-400 hover:bg-green-400 hover:bg-opacity-20 hover:text-white'
                                       }`}
                                            title={usuario.estado === true ? 'Desactivar' : 'Activar'}
                                   >
                                            {usuario.estado === true ? (
                                                <ToggleRight className="w-4 h-4" />
                                      ) : (
                                          <ToggleLeft className="w-4 h-4" />
                                    )}
                                        </button>
                              </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
           </table>

                {usuariosFiltrados.length === 0 && (
                    <div className="text-center py-16">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                     <p className="text-gray-400 text-lg mb-2">
                            {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                        </p>
                        <p className="text-gray-500">
                          {searchTerm ? `No hay resultados para "${searchTerm}"` : 'Agrega el primer usuario del sistema'}
                        </p>
                    </div>
                )}
            </div>
        </div >
    );
}