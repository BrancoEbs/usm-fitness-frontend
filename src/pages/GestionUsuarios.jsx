import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [guardandoId, setGuardandoId] = useState(null);

    // Lista oficial de ramas deportivas USM
    const ramasDisponibles = [
        "Atletismo", "Basquetbol", "Balonmano", "Ciclismo", 
        "Futsal", "Futbol", "Halterofilia", "Karate", 
        "Tenis de Mesa", "Tenis de campo", "Taekwondo", "Voleibol"
    ];

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const resp = await api.get('usuarios/');
            setUsuarios(resp.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeRol = (id, nuevoRol) => {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: parseInt(nuevoRol) } : u));
    };

    const handleChangeSeleccionado = (id, valor) => {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, es_seleccionado: valor, rama_deportiva: valor ? u.rama_deportiva : '' } : u));
    };

    const handleChangeRama = (id, rama) => {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, rama_deportiva: rama } : u));
    };

    const guardarCambios = async (usuario) => {
        if (usuario.es_seleccionado && !usuario.rama_deportiva) {
            alert('Debes seleccionar una rama deportiva para este alumno.');
            return;
        }

        setGuardandoId(usuario.id);
        try {
            await api.patch(`usuarios/${usuario.id}/actualizar_permisos/`, {
                rol: usuario.rol,
                es_seleccionado: usuario.es_seleccionado,
                rama_deportiva: usuario.rama_deportiva
            });
            alert('¡Permisos actualizados!');
        } catch (error) {
            alert("Error al actualizar permisos");
            cargarUsuarios();
        } finally {
            setGuardandoId(null);
        }
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const termino = busqueda.toLowerCase();
        return (
            u.first_name?.toLowerCase().includes(termino) ||
            u.last_name?.toLowerCase().includes(termino) ||
            u.username?.toLowerCase().includes(termino)
        );
    });

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold">Cargando base de datos...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-[#003057]">Gestión de Usuarios</h2>
                        <p className="text-gray-600 font-medium mt-1">Control de roles y selecciones deportivas.</p>
                    </div>
                    
                    <div className="w-full md:w-1/3">
                        <input 
                            type="text" 
                            placeholder="🔍 Buscar por nombre o RUT..." 
                            className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border-t-8 border-[#003057] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-black border-b border-gray-200">Usuario / RUT</th>
                                    <th className="p-4 font-black border-b border-gray-200">Rol</th>
                                    <th className="p-4 font-black border-b border-gray-200 text-center">¿Seleccionado?</th>
                                    <th className="p-4 font-black border-b border-gray-200">Rama Deportiva</th>
                                    <th className="p-4 font-black border-b border-gray-200 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {usuariosFiltrados.map(usuario => (
                                    <tr key={usuario.id} className="hover:bg-blue-50 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800">{usuario.first_name} {usuario.last_name}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{usuario.username}</p>
                                        </td>
                                        
                                        <td className="p-4">
                                            <select 
                                                className="border border-gray-300 p-2 rounded outline-none font-bold text-sm bg-white cursor-pointer"
                                                value={usuario.rol}
                                                onChange={(e) => handleChangeRol(usuario.id, e.target.value)}
                                            >
                                                <option value={1}>1 - Alumno</option>
                                                <option value={2}>2 - Entrenador</option>
                                                <option value={3}>3 - Admin</option>
                                            </select>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={usuario.es_seleccionado}
                                                    onChange={(e) => handleChangeSeleccionado(usuario.id, e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </td>

                                        <td className="p-4">
                                            <select 
                                                className={`border p-2 rounded outline-none font-bold text-sm w-full transition ${
                                                    usuario.es_seleccionado 
                                                        ? 'border-purple-300 bg-purple-50 text-purple-900 cursor-pointer' 
                                                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                                }`}
                                                value={usuario.rama_deportiva || ''}
                                                onChange={(e) => handleChangeRama(usuario.id, e.target.value)}
                                                disabled={!usuario.es_seleccionado}
                                            >
                                                <option value="" disabled>Seleccione una rama...</option>
                                                {ramasDisponibles.map(rama => (
                                                    <option key={rama} value={rama}>{rama}</option>
                                                ))}
                                            </select>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => guardarCambios(usuario)}
                                                disabled={guardandoId === usuario.id}
                                                className={`px-4 py-2 rounded font-black text-sm transition text-white shadow-sm ${
                                                    guardandoId === usuario.id 
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-[#FFC72C] text-[#003057] hover:bg-yellow-500'
                                                }`}
                                            >
                                                {guardandoId === usuario.id ? 'Guardando...' : 'Guardar Cambios'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}