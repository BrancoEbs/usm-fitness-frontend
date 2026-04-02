import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function GestionUsuarios() {
    const [rutBusqueda, setRutBusqueda] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [nuevoRol, setNuevoRol] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    // 1. Función para buscar al usuario por su RUT o Rol USM
    const buscarUsuario = async (e) => {
        e.preventDefault();
        setError('');
        setUsuario(null);
        setIsLoading(true);

        try {
            const resp = await api.get('usuarios/buscar/', {
                params: { rol_usm: rutBusqueda.trim() }
            });
            setUsuario(resp.data);
            setNuevoRol(resp.data.rol.toString());
        } catch (err) {
            setError(err.response?.data?.error || 'Usuario no encontrado.');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Función para guardar el nuevo rol
    const actualizarRol = async () => {
        setIsUpdating(true);
        try {
            await api.patch(`usuarios/${usuario.id}/`, {
                rol: parseInt(nuevoRol)
            });
            alert('¡Permisos actualizados correctamente!');
            // Actualizamos el estado local para reflejar el cambio
            setUsuario({ ...usuario, rol: parseInt(nuevoRol) });
        } catch (err) {
            alert('Error al actualizar los permisos.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Función auxiliar para mostrar el nombre del rol actual
    const getNombreRol = (rolId) => {
        if (rolId === 1) return 'Alumno Regular';
        if (rolId === 2) return 'Entrenador';
        if (rolId === 3) return 'Administrador';
        return 'Desconocido';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="container mx-auto p-6 max-w-2xl">
                <h2 className="text-3xl font-bold text-red-700 mb-6">Gestión de Permisos</h2>

                {/* Panel de Búsqueda */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-t-4 border-red-700">
                    <form onSubmit={buscarUsuario} className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-gray-700 font-bold mb-2">Buscar por Rol USM o RUT</label>
                            <input
                                type="text"
                                value={rutBusqueda}
                                onChange={(e) => setRutBusqueda(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                                placeholder="Ej: 202104001-K"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded transition h-[50px]"
                            >
                                {isLoading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                    </form>

                    {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}
                </div>

                {/* Tarjeta de Resultados */}
                {usuario && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Datos del Usuario</h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Nombre completo</p>
                                <p className="font-bold">{usuario.first_name} {usuario.last_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Identificador (Username)</p>
                                <p className="font-bold">{usuario.username}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rol actual</p>
                                <p className="font-bold text-[#003057]">{getNombreRol(usuario.rol)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">¿Es seleccionado?</p>
                                <p className="font-bold">{usuario.es_seleccionado ? 'Sí' : 'No'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded border">
                            <label className="block text-gray-700 font-bold mb-2">Cambiar Rol a:</label>
                            <div className="flex gap-4">
                                <select
                                    value={nuevoRol}
                                    onChange={(e) => setNuevoRol(e.target.value)}
                                    className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                                >
                                    <option value="1">1 - Alumno Regular</option>
                                    <option value="2">2 - Entrenador</option>
                                    <option value="3">3 - Administrador</option>
                                </select>

                                <button
                                    onClick={actualizarRol}
                                    disabled={isUpdating || parseInt(nuevoRol) === usuario.rol}
                                    className={`font-bold py-2 px-6 rounded transition ${parseInt(nuevoRol) !== usuario.rol
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isUpdating ? 'Guardando...' : 'Aplicar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}