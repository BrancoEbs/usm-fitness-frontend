import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('usuarios/me/')
            .then(res => setUser(res.data))
            .catch(() => {
                localStorage.removeItem('access_token');
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    // Mientras carga el usuario, no mostramos el menú para evitar parpadeos
    if (!user) return <nav className="bg-[#003057] h-16 shadow-md"></nav>;

    return (
        <nav className="bg-[#003057] text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-black tracking-wider text-[#FFC72C]">USM FITNESS</h1>

                <div className="flex items-center space-x-6 font-semibold">

                    {/* MUNDO ALUMNO (Rol 1) */}
                    {user.rol === 1 && (
                        <>
                            <Link to="/" className="hover:text-[#FFC72C] transition">Reservar Hora</Link>
                            <Link to="/reservas" className="hover:text-[#FFC72C] transition">Mis Reservas</Link>
                            <Link to="/ficha" className="hover:text-[#FFC72C] transition">Mi Ficha</Link>
                            <Link to="/planes" className="hover:text-[#FFC72C] transition">Mis Rutinas</Link>
                        </>
                    )}

                    {/* MUNDO STAFF: Entrenador y Admin (Rol 2 y 3) */}
                    {user.rol >= 2 && (
                        <>
                            <Link to="/asistencia" className="hover:text-[#FFC72C] transition">Asistencia</Link>
                            <Link to="/admin/bloques" className="hover:text-[#FFC72C] transition">Gestión Bloques</Link>
                            <Link to="/entrenador/rutinas" className="hover:text-[#FFC72C] transition">Gestor Rutinas</Link>
                            <Link to="/admin/usuarios" className="hover:text-[#FFC72C] transition">Permisos Usuarios</Link>
                        </>
                    )}

                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-sm bg-blue-800 px-3 py-1 rounded-full border border-blue-600">
                        {user.first_name} | {user.rol === 1 ? 'Alumno' : user.rol === 2 ? 'Entrenador' : 'Admin'}
                    </span>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold transition">
                        Salir
                    </button>
                </div>
            </div>
        </nav>
    );
}