import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { crearUsuario } from '@/services/usuario.service';

interface ModalCrearUsuarioProps {
    isOpen: boolean;
    onClose: () => void;
    onCrearUsuario: (usuario: { nombre: string; email: string; contrasena: string }) => void;
}

export default function ModalCrearUsuario({ isOpen, onClose, onCrearUsuario }: ModalCrearUsuarioProps) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const [errorNombre, setErrorNombre] = useState('');
    const [errorEmail, setErrorEmail] = useState('');
    const [errorContrasena, setErrorContrasena] = useState('');

    if (!isOpen) return null;

    // Validaciones
    const validateNombre = (value: string) => {
        if (value.length < 1 || value.length > 30) {
            return 'El nombre debe tener entre 1 y 30 caracteres';
        }
        return '';
    };

    const validateEmail = (value: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
            return 'El formato del correo electrónico no es válido';
        }
        return '';
    };

    const validateContrasena = (value: string) => {
        if (!value || value.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!/\d/.test(value)) {
            return 'La contraseña debe contener al menos un número';
        }
        if (!/[A-Z]/.test(value)) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
            return 'La contraseña debe contener al menos un carácter especial';
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos
    const nombreError = validateNombre(nombre);
    const emailError = validateEmail(email);
    const contrasenaError = validateContrasena(contrasena);

    setErrorNombre(nombreError);
    setErrorEmail(emailError);
    setErrorContrasena(contrasenaError);

    if (nombreError || emailError || contrasenaError) return;

    try {
        await crearUsuario({ nombre, correo: email, contrasena }); // Espera a que se cree en backend
        onCrearUsuario({ nombre, email, contrasena }); // Notifica al padre para refrescar la lista
        setNombre('');
        setEmail('');
        setContrasena('');
        setErrorNombre('');
        setErrorEmail('');
        setErrorContrasena('');
        onClose();
    } catch (error) {
        console.error('Error al crear el usuario:', error);
    }
};

    const toggleMotrarContrasena = () => {
        setMostrarContrasena(!mostrarContrasena);
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
            <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-white mb-4">Crear Usuario</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-background text-white"
                            required
                        />
                        {errorNombre && <p className="text-red-400 text-xs mt-1">{errorNombre}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Correo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                setErrorEmail(validateEmail(e.target.value));
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-background text-white"
                            required
                        />
                        {errorEmail && <p className="text-red-400 text-xs mt-1">{errorEmail}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={mostrarContrasena ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={contrasena}
                                onChange={(e) => {
                                    setContrasena(e.target.value);
                                    setErrorContrasena(validateContrasena(e.target.value));
                                }}
                                className="w-full px-3 py-1.5 border bg-label text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                            <div
                                className="absolute text-white inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={toggleMotrarContrasena}
                            >
                                {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                        {errorContrasena && <p className="text-red-400 text-xs mt-1">{errorContrasena}</p>}
                    </div>
                    <div className="flex gap-2 mt-6">
                        <button
                            type="submit"
                            disabled={
                                !nombre ||
                                !email ||
                                !contrasena ||
                                !!errorNombre ||
                                !!errorEmail ||
                                !!errorContrasena
                            }
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${(!nombre || !email || !contrasena || errorNombre || errorEmail || errorContrasena)
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-orange-400 text-white hover:bg-orange-500'
                                }`}
                        >
                            Crear
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}