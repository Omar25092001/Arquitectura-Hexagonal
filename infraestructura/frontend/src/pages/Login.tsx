import { useState, useEffect } from 'react';
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '@/services/usuario.service';
import { useUserStore } from '@/store/user.store';



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const navigate = useNavigate();

    const handleLogout = useUserStore((state) => state.handleLogout);
    const onLogin = useUserStore((state) => state.handleLogin);

    const toggleMotrarContrasena = () => {
        setMostrarContrasena(!mostrarContrasena);
    };

    useEffect(() => {
        localStorage.clear();
        handleLogout();
    }, []);

    useEffect(() => {
        // Crear un estilo para los inputs autocompletados
        const style = document.createElement('style');
        style.textContent = `
            input:-webkit-autofill,
            input:-webkit-autofill:hover, 
            input:-webkit-autofill:focus, 
            input:-webkit-autofill:active {
                -webkit-box-shadow: 0 0 0 30px #292F42 inset !important;
                -webkit-text-fill-color: #d1d5db !important;
                transition: background-color 5000s ease-in-out 0s;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const usuario = {
                correo: email,
                contrasena: password
            };
            const response = await loginUsuario(usuario);
            if (response.message == 'Login exitoso') {
                if (response.usuario.correo == 'admin@gmail.com') {
                    console.log('Login attempt with:', { email, password });
                    onLogin(response.usuario.id, response.usuario.nombre, 'admin', response.token);
                    navigate('/admin/dashboard');
                }
                else {
                    onLogin(response.usuario.id, response.usuario.nombre, 'usuario', response.token);
                    console.log('Login attempt with:', { email, password });
                    navigate('/usuario/fuente-datos');
                }
            }

            else {
                console.error('Login failed:', response);
                console.log('Error al iniciar sesión. Por favor, verifica tus credenciales.');
            }

        } catch (error) {
            console.error('Error during login:', error);
            console.log('Error al iniciar sesión. Por favor, verifica tus credenciales.');
            return;
        }

    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-sm p-6 bg-secundary rounded-2xl shadow-md">
                <div className="text-center">

                </div>
                <div className="flex items-center justify-center ">
                    <img
                        src="assets/logo.png"
                        alt="Logo"
                        className="w-30 h-30 "
                    />
                </div>
                <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-1.5 mt-1 border bg-label text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-1.5 border bg-label text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                                />
                                <div
                                    className="absolute text-white inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => toggleMotrarContrasena()}
                                >
                                    {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-1.5 text-sm font-medium text-white bg-button-dark rounded-xl hover:bg-button-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-dark"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;