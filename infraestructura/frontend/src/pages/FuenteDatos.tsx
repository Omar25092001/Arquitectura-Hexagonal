import { useState } from 'react';
import Header from '../components/Header';
import ConfigMQTT from '@/components/ConfigMQTT';
import ConfigWebSocket from '@/components/ConfigWebSocket';
import ConfigHTTP from '@/components/ConfigHTTP';
import ConfigInflux from '@/components/ConfigInflux';
import ConfigExcel from '@/components/ConfigExcel';
import { CheckCircle, ArrowRight,ChevronDown } from 'lucide-react';
import { GrSatellite } from "react-icons/gr";
import { SiInfluxdb } from "react-icons/si";
import { RiFileExcel2Fill } from "react-icons/ri";

export default function FuenteDatos() {
    const [selectedDataSource, setSelectedDataSource] = useState('mqtt');
    const [selectedProtocol, setSelectedProtocol] = useState('mqtt');
    const [protocolDropdownOpen, setProtocolDropdownOpen] = useState(false);

    const protocolOptions = [
        { id: 'mqtt', name: 'MQTT' },
        { id: 'websocket', name: 'WebSocket' },
        { id: 'http', name: 'HTTP/REST' }
    ];
    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: false },
        { id: 3, title: 'Algoritmo', active: false },
        { id: 4, title: 'Ejecución', active: false }
    ];

    const dataSourceOptions = [
        {
            id: 'mqtt',
            title: 'Protocolo Directo',
            subtitle: 'MQTT, Websocket HTTP',
            icon: <GrSatellite className="w-8 h-8" />,
            selected: selectedDataSource === 'mqtt'
        },
        {
            id: 'influx',
            title: 'InfluxDB',
            subtitle: 'Base de datos temporal',
            icon: <SiInfluxdb className="w-8 h-8" />,
            selected: selectedDataSource === 'influx'
        },
        {
            id: 'file',
            title: 'Archivo Excel',
            subtitle: 'Datos Historicos CSV/XLSX',
            icon: <RiFileExcel2Fill className="w-8 h-8" />,
            selected: selectedDataSource === 'file'
        }
    ];

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center px-4 ">
                {/* Tarjeta con bg-secundary */}
                <div className="flex flex-wrap space-x-2 md:space-x-4 mb-6 overflow-x-auto pb-2">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center mb-2 ${step.active ? 'text-orange-400' : 'text-gray-500'}`}
                        >
                            {step.active ? (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            ) : (
                                <span className="w-5 h-5 mr-2 flex items-center justify-center rounded-full border border-current">
                                    {step.id}
                                </span>
                            )}
                            <span className="whitespace-nowrap">{step.title}</span>
                        </div>
                    ))}
                </div>
                <div className="w-full max-w-4xl bg-secundary rounded-2xl shadow-md overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-xl font-bold text-white">Paso 1: Seleccionar Fuente de Datos</h1>
                        </div>

                        {/* Opciones de fuentes de datos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {dataSourceOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => setSelectedDataSource(option.id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-colors ${option.selected
                                        ? 'bg-background-transparent border-2 border-background text-white'
                                        : 'bg-secundary border-2 border-background text-gray-300 hover:bg-background-transparent hover:border-background'
                                        }`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-3">
                                            {option.icon}
                                        </div>
                                        <h2 className="font-semibold text-lg mb-1">{option.title}</h2>
                                        <p className="text-sm">{option.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-white mb-4">Configuración de la Conexión</h2>

                            {selectedDataSource === 'mqtt' && (
                                <div className="mb-6">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Tipo de Protocolo
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setProtocolDropdownOpen(!protocolDropdownOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            >
                                                <span>{protocolOptions.find(p => p.id === selectedProtocol)?.name}</span>
                                                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${protocolDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {protocolDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-background border border-background rounded-lg shadow-lg">
                                                    {protocolOptions.map((protocol) => (
                                                        <div
                                                            key={protocol.id}
                                                            onClick={() => {
                                                                setSelectedProtocol(protocol.id);
                                                                setProtocolDropdownOpen(false);
                                                            }}
                                                            className="px-3 py-2 hover:bg-secundary cursor-pointer text-gray-300"
                                                        >
                                                            {protocol.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedProtocol === 'mqtt' && <ConfigMQTT />}
                                    {selectedProtocol === 'websocket'&& <ConfigWebSocket />}
                                    {selectedProtocol === 'http' && <ConfigHTTP />}
                                </div>
                            )}
                            {selectedDataSource === 'influx' && <ConfigInflux />}
                            {selectedDataSource === 'file' && <ConfigExcel />}
                        </div>

                        {/* Botón de acción */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => console.log('Next Step')}
                                className="bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-500 transition-colors"
                            >
                                Siguiente Paso
                                <ArrowRight className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}