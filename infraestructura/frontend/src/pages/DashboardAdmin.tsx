import { useState, useEffect } from 'react';
import { Users, UserMinus, Activity, Search, UserPlus } from 'lucide-react';
import Header from '../components/Admin/Header';
import ListaUsuarios, { Usuario } from '../components/Admin/ListaUsuarios';
import { obtenerUsuarios } from '../services/usuario.service'; // ← Importar el servicio

export default function DashboardAdmin() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [usuariosActivos, setUsuariosActivos] = useState(0);
    const [usuariosInactivos, setUsuariosInactivos] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);

    // Cargar usuarios desde el backend
    useEffect(() => {
        const cargarUsuarios = async () => {
            setLoading(true);
            try {
                const response = await obtenerUsuarios();
                console.log('Respuesta del backend:', response);
                // Mapear la respuesta del backend a la estructura que espera tu componente
                const usuariosMapeados: Usuario[] = response.data.map((item: any) => ({
                    id: item.usuario.id,
                    nombre: item.usuario.nombre,
                    email: item.usuario.correo, // ← Nota: cambio de 'correo' a 'email'
                    fechaRegistro: item.usuario.fechaRegistro.split('T')[0], // Solo la fecha
                    ultimoAcceso: item.usuario.ultimoAcceso,
                    estado: item.usuario.estado // Por defecto
                }));

                setUsuarios(usuariosMapeados);
                setTotalUsuarios(response.total);
                setUsuariosActivos(usuariosMapeados.filter(u => u.estado === true).length);
                setUsuariosInactivos(usuariosMapeados.filter(u => u.estado === false).length);
                
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
                // Mantener usuarios vacíos en caso de error
                setUsuarios([]);
                setTotalUsuarios(0);
                setUsuariosActivos(0);
                setUsuariosInactivos(0);
            } finally {
                setLoading(false);
            }
        };

        cargarUsuarios();
    }, []);

    // Resto de funciones existentes...
    const handleVerUsuario = (usuario: Usuario) => {
        setSelectedUser(usuario);
        setShowUserModal(true);
    };

    const handleEliminarUsuario = (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            const usuariosActualizados = usuarios.filter(u => u.id !== id);
            setUsuarios(usuariosActualizados);
            recalcularEstadisticas(usuariosActualizados);
        }
    };

    const handleCambiarEstado = (id: number) => {
        const usuariosActualizados = usuarios.map(u => 
            u.id === id ? { ...u, estado: u.estado === true ? false : true } as Usuario : u
        );
        setUsuarios(usuariosActualizados);
        recalcularEstadisticas(usuariosActualizados);
        
        if (selectedUser && selectedUser.id === id) {
            setSelectedUser(usuariosActualizados.find(u => u.id === id) || null);
        }
    };

    const recalcularEstadisticas = (usuariosActualizados: Usuario[]) => {
        setTotalUsuarios(usuariosActualizados.length);
        setUsuariosActivos(usuariosActualizados.filter(u => u.estado === true).length);
        setUsuariosInactivos(usuariosActualizados.filter(u => u.estado === false).length);
    };

    const handleCrearUsuario = () => {
        setShowCreateUserModal(true);
    };

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
                        <p className="text-white text-lg">Cargando usuarios...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            
            <div className="flex-grow p-6">
                {/* Header del Dashboard */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-gray-400">Administra todos los usuarios del sistema</p>
                </div>

                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-secundary rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Usuarios</p>
                                <p className="text-2xl font-bold text-white">{totalUsuarios}</p>
                            </div>
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-secundary rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Usuarios Activos</p>
                                <p className="text-2xl font-bold text-green-400">{usuariosActivos}</p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <Activity className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-secundary rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Usuarios Inactivos</p>
                                <p className="text-2xl font-bold text-red-400">{usuariosInactivos}</p>
                            </div>
                            <div className="bg-red-500/20 p-3 rounded-lg">
                                <UserMinus className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de Búsqueda y Acciones */}
                <div className="bg-secundary rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar usuarios por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-background text-white rounded-lg border border-gray-600 focus:border-orange-400 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex-shrink-0">
                            <button
                                onClick={handleCrearUsuario}
                                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium whitespace-nowrap"
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                Crear Usuario
                            </button>
                        </div>
                    </div>

                    {searchTerm && (
                        <div className="mt-4 text-sm text-gray-400">
                            {usuarios.filter(u =>
                                u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                u.email.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length} resultado(s) encontrado(s) para "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Componente de Lista de Usuarios */}
                <ListaUsuarios
                    usuarios={usuarios}
                    searchTerm={searchTerm}
                    onCambiarEstado={handleCambiarEstado}
                    onEliminarUsuario={handleEliminarUsuario}
                />
            </div>

           
        </div>
    );
}