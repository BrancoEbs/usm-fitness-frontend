import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Navbar() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    // Ahora el estado guarda tanto el rol como el nombre de pila
    const [usuarioActual, setUsuarioActual] = useState({ rol: null, nombre: '' });
    const navigate = useNavigate();

    useEffect(() => {
        api.get('usuarios/me/')
            .then(response => {
                setUsuarioActual({
                    rol: response.data.rol,
                    // Extraemos solo el primer nombre para mantener el diseño limpio
                    nombre: response.data.first_name || 'Usuario'
                });
            })
            .catch(error => {
                console.error("Error al cargar perfil en navbar:", error);
            });
    }, []);

    const toggleMenu = () => {
        setMenuAbierto(!menuAbierto);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const renderLinks = (isMobile = false) => {
        const baseClass = isMobile 
            ? "block px-4 py-3 rounded-lg text-lg font-bold text-gray-200 hover:bg-[#003057] hover:text-[#FFC72C] transition"
            : "text-gray-200 hover:text-[#FFC72C] transition font-bold text-lg";

        const handleMobileClick = () => {
            if (isMobile) setMenuAbierto(false);
        };

        const links = [
            <Link key="inicio" to="/" onClick={handleMobileClick} className={baseClass}>Inicio</Link>
        ];

        if (usuarioActual.rol === 1) {
            links.push(<Link key="reservas" to="/reservas" onClick={handleMobileClick} className={baseClass}>Mis Reservas</Link>);
            links.push(<Link key="ficha" to="/ficha" onClick={handleMobileClick} className={baseClass}>Mi Ficha</Link>);
            links.push(<Link key="planes" to="/planes" onClick={handleMobileClick} className={baseClass}>Mis Rutinas</Link>);
        } else if (usuarioActual.rol === 2) {
            links.push(<Link key="asistencia" to="/asistencia" onClick={handleMobileClick} className={baseClass}>Asistencia</Link>);
            links.push(<Link key="rutinas" to="/entrenador/rutinas" onClick={handleMobileClick} className={baseClass}>Gestor de Rutinas</Link>);
            links.push(<Link key="bloques" to="/admin/bloques" onClick={handleMobileClick} className={baseClass}>Gestión Horarios</Link>);
            links.push(<Link key="fichas" to="/fichas-alumnos" onClick={handleMobileClick} className={baseClass}>Fichas Alumnos</Link>);
        } else if (usuarioActual.rol === 3) {
            links.push(<Link key="asistencia" to="/asistencia" onClick={handleMobileClick} className={baseClass}>Asistencia</Link>);
            links.push(<Link key="fichas" to="/fichas-alumnos" onClick={handleMobileClick} className={baseClass}>Fichas Alumnos</Link>); // Agregado
            links.push(<Link key="bloques" to="/admin/bloques" onClick={handleMobileClick} className={baseClass}>Gestión Horarios</Link>);
            links.push(<Link key="usuarios" to="/admin/usuarios" onClick={handleMobileClick} className={baseClass}>Gestión Usuarios</Link>);
        }

        return links;
    };

    return (
        <nav className="bg-[#003057] text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center h-20">
                    
                    {/* 1. TÍTULO (Columna Izquierda) */}
                    <div className="flex-1 flex items-center">
                        <Link to="/" className="font-black text-2xl tracking-widest text-white hover:text-[#FFC72C] transition">
                            GIMNASIO <span className="text-[#FFC72C]">USM</span>
                        </Link>
                    </div>

                    {/* 2. MENÚ CENTRAL (Columna Central - Oculto en móvil) */}
                    <div className="hidden md:flex flex-1 justify-center space-x-4 items-center">
                        {renderLinks(false)}
                    </div>

                    {/* 3. USUARIO Y SALIR (Columna Derecha - Oculto en móvil) */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-5">
                        {usuarioActual.nombre && (
                            <div className="text-right">
                                <span className="text-sm text-gray-300 font-medium block leading-none">Hola,</span>
                                <span className="font-bold text-[#FFC72C]">{usuarioActual.nombre}</span>
                            </div>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-black transition shadow-sm"
                        >
                            Salir
                        </button>
                    </div>

                    {/* BOTÓN HAMBURGUESA (MÓVIL) */}
                    <div className="md:hidden flex items-center justify-end flex-1">
                        <button 
                            onClick={toggleMenu}
                            className="text-white hover:text-[#FFC72C] focus:outline-none p-2"
                        >
                            <svg className="w-8 h-8 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {menuAbierto ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* MENÚ DESPLEGABLE MÓVIL */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${menuAbierto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="px-4 pt-4 pb-6 space-y-2 bg-[#002240] border-t border-[#003057] shadow-inner flex flex-col">
                    
                    {/* Perfil del usuario en vista móvil */}
                    {usuarioActual.nombre && (
                        <div className="px-4 pb-3 mb-2 border-b border-[#003057]">
                            <span className="text-gray-400 font-medium text-sm block">Conectado como:</span>
                            <span className="text-[#FFC72C] font-bold text-xl">{usuarioActual.nombre}</span>
                        </div>
                    )}

                    {renderLinks(true)}
                    
                    <button 
                        onClick={() => {
                            setMenuAbierto(false);
                            handleLogout();
                        }}
                        className="w-full text-center block px-4 py-3 mt-6 bg-red-500 hover:bg-red-600 text-white rounded-lg font-black transition shadow-md"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
}