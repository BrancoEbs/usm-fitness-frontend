import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Formateador inteligente
    const handleRutChange = (e) => {
        let value = e.target.value;

        // BYPASS: Detecta cualquier letra que NO sea K o k
        if (/[a-jl-zñ]/i.test(value)) {
            setRut(value);
            return;
        }

        // Formateo estricto de RUT para los alumnos
        const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
        if (clean.length > 1) {
            setRut(`${clean.slice(0, -1)}-${clean.slice(-1)}`);
        } else {
            setRut(clean);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);


        try {
            const response = await api.post('token/', {
                username: rut, // Enviamos el RUT formateado al backend
                password: password
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            navigate('/');
        } catch (err) {
            setError('RUT o contraseña incorrectos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#003057]">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-black text-center text-[#003057] mb-6">USM FITNESS</h2>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-bold border border-red-300">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-1">RUT o Usuario</label>
                        <input
                            type="text"
                            placeholder="Ej: 12345678-9"
                            required
                            maxLength="15"
                            className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C] font-mono text-lg tracking-wider"
                            value={rut}
                            onChange={handleRutChange} // <-- Usamos el nuevo formateador
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-1">Contraseña</label>
                        <input
                            type="password"
                            placeholder="Tu contraseña"
                            required
                            className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-[#003057] hover:bg-blue-900 text-white font-black py-3 rounded transition text-lg mt-4 shadow-md">
                        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
                    ¿No tienes cuenta? <Link to="/registro" className="text-[#FFC72C] font-black hover:underline">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}