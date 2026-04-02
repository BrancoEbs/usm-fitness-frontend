import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Registro() {
    const [formData, setFormData] = useState({ rut: '', first_name: '', last_name: '', carrera: '', password: '' });
    const [confirmarPassword, setConfirmarPassword] = useState(''); // <-- NUEVO ESTADO
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Función que fuerza el formato 12345678-9 mientras escribes
    const handleRutChange = (e) => {
        // 1. Quitar todo lo que no sea número o la letra K
        const clean = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();

        // 2. Insertar el guion automáticamente antes del último dígito
        if (clean.length > 1) {
            setFormData({ ...formData, rut: `${clean.slice(0, -1)}-${clean.slice(-1)}` });
        } else {
            setFormData({ ...formData, rut: clean });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // VALIDACIÓN 1: El RUT debe tener un largo lógico (mínimo 8 caracteres)
        if (formData.rut.length < 8) {
            return setError('Por favor, ingresa un RUT válido.');
        }

        // VALIDACIÓN 2: Las contraseñas deben ser idénticas
        if (formData.password !== confirmarPassword) {
            return setError('Las contraseñas no coinciden. Inténtalo de nuevo.');
        }

        setIsLoading(true);

        try {
            await api.post('registro/', formData);
            alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            // Si el backend se queja porque el "username" (RUT) ya existe:
            if (err.response?.data?.username) {
                setError('Este RUT ya se encuentra registrado en el sistema.');
            } else {
                setError('Error al crear la cuenta. Verifica tus datos.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#003057]">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-black text-center text-[#003057] mb-2">Crear Cuenta</h2>
                <p className="text-center text-gray-500 mb-6">Regístrate para reservar tus módulos</p>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-bold border border-red-300">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="RUT XXXXXXXX-X"
                        required
                        maxLength="10"
                        className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C] font-mono text-lg tracking-wider"
                        value={formData.rut}
                        onChange={handleRutChange} // <-- Usamos el formateador
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Nombre" required className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C]"
                            value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                        <input type="text" placeholder="Apellido" required className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C]"
                            value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                    </div>

                    <input type="text" placeholder="Carrera (Ej: Ing. Informática)" required className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C]"
                        value={formData.carrera} onChange={e => setFormData({ ...formData, carrera: e.target.value })} />

                    <input type="password" placeholder="Crea una Contraseña" required className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C]"
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

                    {/* NUEVO CAMPO DE CONFIRMACIÓN */}
                    <input type="password" placeholder="Repite tu Contraseña" required className="w-full border p-3 rounded bg-gray-50 outline-none focus:ring-2 focus:ring-[#FFC72C]"
                        value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)} />

                    <button type="submit" disabled={isLoading} className="w-full bg-[#FFC72C] hover:bg-yellow-500 text-[#003057] font-black py-3 rounded transition text-lg mt-4 shadow-md">
                        {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-[#003057] font-bold hover:underline">Inicia Sesión aquí</Link>
                </div>
            </div>
        </div>
    );
}