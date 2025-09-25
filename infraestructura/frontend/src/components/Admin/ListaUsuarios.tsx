import { Users, Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    fechaRegistro: string;
    ultimoAcceso: string;
    estado: 'activo' | 'inactivo';
}

interface ListaUsuariosProps {
    usuarios: Usuario[];
    searchTerm?: string;
    onVerUsuario?: (usuario: Usuario) => void;
    onCambiarEstado: (id: number) => void;
    onEliminarUsuario: (id: number) => void;
}

export default function ListaUsuarios({ 
    usuarios, 
    searchTerm = '',
    onVerUsuario,
    onCambiarEstado, 
    onEliminarUsuario 
}: ListaUsuariosProps) {
    
    // Filtrar usuarios basado en la búsqueda
    const usuariosFiltrados = usuarios.filter(usuario => {
        if (!searchTerm) return true;
        
        const matchNombre = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchEmail = usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchNombre || matchEmail;
    });

    return (
        <div className="bg-secundary rounded-xl">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    Lista de Usuarios ({usuariosFiltrados.length})
                </h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-background">
                        <tr className="border-b border-gray-700">
                            <th className="text-left text-gray-300 p-4 w-1/5">Nombre</th>
                            <th className="text-left text-gray-300 p-4 w-1/4">Email</th>
                            <th className="text-left text-gray-300 p-4 w-1/6">Rol</th>
                            <th className="text-left text-gray-300 p-4 w-1/6">Registro</th>
                            <th className="text-left text-gray-300 p-4 w-1/8">Estado</th>
                            <th className="text-center text-gray-300 p-4 w-1/6">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map((usuario) => (
                            <tr key={usuario.id} className="border-b border-gray-700 hover:bg-label transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                                            {usuario.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-white font-medium">{usuario.nombre}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-300">{usuario.email}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-300 capitalize">{usuario.rol}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-300">{usuario.fechaRegistro}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        usuario.estado === 'activo' 
                                            ? 'bg-green-600 bg-opacity-30 text-green-300' 
                                            : 'bg-red-600 bg-opacity-30 text-red-300'
                                    }`}>
                                        {usuario.estado}
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
                                            className={`p-2 rounded-lg transition-colors ${
                                                usuario.estado === 'activo'
                                                    ? 'text-red-400 hover:bg-red-400 hover:bg-opacity-20'
                                                    : 'text-green-400 hover:bg-green-400 hover:bg-opacity-20'
                                            }`}
                                            title={usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                        >
                                            {usuario.estado === 'activo' ? (
                                                <ToggleRight className="w-4 h-4" />
                                            ) : (
                                                <ToggleLeft className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onEliminarUsuario(usuario.id)}
                                            className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-lg transition-colors"
                                            title="Eliminar usuario"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
        </div>
    );
}