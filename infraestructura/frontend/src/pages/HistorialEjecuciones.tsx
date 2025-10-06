import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/user.store';
import { obtenerEjecucionesPorUsuario, type EjecucionAlgoritmo } from '../services/ejecucion.service';
import Header from '../components/Header';
import ModalDetalleEjecucion from '../components/Historial/ModalDetalleEjecucion';
import ListadoEjecuciones from '../components/Historial/ListadoEjecuciones';
import {  RefreshCw, ChevronDown, Calendar } from 'lucide-react';

export default function HistorialEjecuciones() {
    const [ejecuciones, setEjecuciones] = useState<EjecucionAlgoritmo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string>('');
    const [ejecucionSeleccionada, setEjecucionSeleccionada] = useState<EjecucionAlgoritmo | null>(null);
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [filtroFecha, setFiltroFecha] = useState<string>('todas');
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const userId = useUserStore((state) => state.user.id);

    useEffect(() => {
        if (userId) {
            cargarHistorial();
        }
    }, [userId]);

    const cargarHistorial = async () => {
        try {
            setCargando(true);
            setError('');
            const datos = await obtenerEjecucionesPorUsuario(userId);
            setEjecuciones(datos);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el historial');
        } finally {
            setCargando(false);
        }
    };

    
    
    // Filtrado por fecha
    const filtrarPorFecha = (ejecucion: EjecucionAlgoritmo): boolean => {
        const fechaEjecucion = new Date(ejecucion.fechaEjecucion);
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);

        switch (filtroFecha) {
            case 'hoy':
                const inicioHoy = new Date(hoy);
                inicioHoy.setHours(0, 0, 0, 0);
                return fechaEjecucion >= inicioHoy && fechaEjecucion <= hoy;
            
            case 'semana':
                const inicioSemana = new Date(hoy);
                inicioSemana.setDate(hoy.getDate() - 7);
                inicioSemana.setHours(0, 0, 0, 0);
                return fechaEjecucion >= inicioSemana && fechaEjecucion <= hoy;
            
            case 'mes':
                const inicioMes = new Date(hoy);
                inicioMes.setDate(hoy.getDate() - 30);
                inicioMes.setHours(0, 0, 0, 0);
                return fechaEjecucion >= inicioMes && fechaEjecucion <= hoy;
            
            case 'personalizado':
                if (!fechaDesde && !fechaHasta) return true;
                const desde = fechaDesde ? new Date(fechaDesde) : new Date(0);
                const hasta = fechaHasta ? new Date(fechaHasta) : new Date();
                hasta.setHours(23, 59, 59, 999);
                return fechaEjecucion >= desde && fechaEjecucion <= hasta;
            
            default:
                return true;
        }
    };

    const ejecucionesFiltradas = ejecuciones
        .filter(e => filtroTipo === 'todos' || e.tipoAlgoritmo === filtroTipo)
        .filter(e => filtrarPorFecha(e))
        .sort((a, b) => new Date(b.fechaEjecucion).getTime() - new Date(a.fechaEjecucion).getTime());

    if (!userId) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <Header />
                <div className="flex items-center justify-center flex-grow">
                    <div className="bg-secundary border border-orange-400 rounded-2xl p-8 text-center max-w-md">
                        <p className="text-white text-lg font-semibold mb-2">No hay usuario autenticado</p>
                        <p className="text-gray-300 text-sm">
                            Por favor, inicia sesión para ver tu historial
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <Header />
                <div className="flex items-center justify-center flex-grow">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-400"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <Header />
                <div className="flex items-center justify-center flex-grow px-4">
                    <div className="bg-secundary border border-red-500 rounded-2xl p-8 text-center max-w-md">
                        <p className="text-red-300 text-lg mb-4">{error}</p>
                        <button
                            onClick={cargarHistorial}
                            className="px-6 py-3 bg-orange-400 text-white hover:bg-orange-500 rounded-lg transition-colors font-medium"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-start px-4 py-6">
                <div className="w-full max-w-7xl space-y-6">
                    {/* Encabezado */}
                    <div className="bg-secundary rounded-2xl shadow-md p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    Historial de Ejecuciones
                                </h1>
                                <p className="text-gray-300">
                                    Total: <span className="font-semibold text-orange-400">{ejecucionesFiltradas.length}</span> ejecuciones registradas
                                </p>
                            </div>

                            <button
                                onClick={cargarHistorial}
                                className="mt-4 md:mt-0 px-6 py-3 bg-orange-400 text-white hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors font-medium"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Actualizar
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Filtro por Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Filtrar por tipo
                                </label>
                                <div className="relative">
                                    <select
                                        value={filtroTipo}
                                        onChange={(e) => setFiltroTipo(e.target.value)}
                                        className="w-full bg-background border-2 border-gray-700 text-white rounded-lg px-4 py-3 pr-10 appearance-none focus:outline-none focus:border-orange-400 transition-colors cursor-pointer"
                                    >
                                        <option value="todos">Todos los tipos</option>
                                        <option value="predictivo">Predictivo</option>
                                        <option value="optimizacion">Optimización</option>
                                        <option value="clasificacion">Clasificación</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Filtro por Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Filtrar por fecha
                                </label>
                                <div className="relative">
                                    <select
                                        value={filtroFecha}
                                        onChange={(e) => {
                                            setFiltroFecha(e.target.value);
                                            if (e.target.value !== 'personalizado') {
                                                setFechaDesde('');
                                                setFechaHasta('');
                                            }
                                        }}
                                        className="w-full bg-background border-2 border-gray-700 text-white rounded-lg px-4 py-3 pr-10 appearance-none focus:outline-none focus:border-orange-400 transition-colors cursor-pointer"
                                    >
                                        <option value="todas">Todas las fechas</option>
                                        <option value="hoy">Hoy</option>
                                        <option value="semana">Última semana</option>
                                        <option value="mes">Último mes</option>
                                        <option value="personalizado">Rango personalizado</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Rango de fechas personalizado */}
                            {filtroFecha === 'personalizado' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Fecha desde
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={fechaDesde}
                                                onChange={(e) => setFechaDesde(e.target.value)}
                                                className="w-full bg-background border-2 border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 transition-colors"
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Fecha hasta
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={fechaHasta}
                                                onChange={(e) => setFechaHasta(e.target.value)}
                                                className="w-full bg-background border-2 border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 transition-colors"
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Lista de ejecuciones */}
                    {ejecucionesFiltradas.length === 0 ? (
                        <div className="bg-secundary border border-gray-700 rounded-2xl p-12 text-center">
                            <p className="text-gray-300 text-lg mb-2">No hay ejecuciones registradas</p>
                            <p className="text-gray-400 text-sm">
                                {(filtroTipo !== 'todos' || filtroFecha !== 'todas') 
                                    ? 'Prueba ajustando los filtros' 
                                    : 'Ejecuta tu primer algoritmo para ver resultados aquí'}
                            </p>
                        </div>
                    ) : (
                        <ListadoEjecuciones
                            ejecuciones={ejecucionesFiltradas}
                            onSeleccionar={setEjecucionSeleccionada}
                        />
                    )}

                    {/* Modal de detalles */}
                    <ModalDetalleEjecucion
                        ejecucion={ejecucionSeleccionada}
                        onClose={() => setEjecucionSeleccionada(null)}
                    />
                </div>
            </div>
        </div>
    );
}