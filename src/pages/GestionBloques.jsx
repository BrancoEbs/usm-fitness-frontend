import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function GestionBloques() {
    // Estados de Configuración Global
    const [config, setConfig] = useState({ gimnasio_abierto: true, mensaje_cierre: '' });
    const [guardandoConfig, setGuardandoConfig] = useState(false);
    
    // Estados de Bloques y Entrenadores
    const [bloques, setBloques] = useState([]);
    const [entrenadores, setEntrenadores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estado para la interfaz (Acordeón)
    const [diaExpandido, setDiaExpandido] = useState(null);
    const [guardandoBloqueId, setGuardandoBloqueId] = useState(null);

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            const [resConfig, resBloques, resUsuarios] = await Promise.all([
                api.get('configuracion/'),
                api.get('bloques/'),
                api.get('usuarios/')
            ]);
            
            setConfig(resConfig.data);
            setBloques(resBloques.data);
            setEntrenadores(resUsuarios.data.filter(u => u.rol >= 2));
            
            // Solo abrimos el primer día si hay bloques y no hay ninguno abierto aún
            if (resBloques.data.length > 0) {
                const fechas = [...new Set(resBloques.data.map(b => b.fecha))].sort();
                setDiaExpandido(prev => prev || fechas[0]);
            }
        } catch (error) {
            console.error("Error al cargar datos", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Función exclusiva para recargar solo los bloques después de editar uno
    const cargarBloques = async () => {
        try {
            const res = await api.get('bloques/');
            setBloques(res.data);
        } catch (error) {
            console.error("Error al recargar bloques", error);
        }
    };

    // --- FUNCIONES DEL INTERRUPTOR MAESTRO ---
    const guardarConfiguracion = async () => {
        setGuardandoConfig(true);
        try {
            await api.patch('configuracion/', config);
            alert('Configuración global actualizada con éxito.');
        } catch (error) {
            alert('Error al guardar la configuración.');
        } finally {
            setGuardandoConfig(false);
        }
    };

    // --- FUNCIONES DE LOS BLOQUES ---
    const handleChangeBloque = (id, campo, valor) => {
        setBloques(bloques.map(b => b.id === id ? { ...b, [campo]: valor } : b));
    };

    const actualizarBloque = async (bloque) => {
        setGuardandoBloqueId(bloque.id);
        try {
            // AQUÍ: Usamos entrenador_a_cargo
            const payload = {
                aforo_regular: parseInt(bloque.aforo_regular),
                entrenador_a_cargo: bloque.entrenador_a_cargo ? parseInt(bloque.entrenador_a_cargo) : null
            };

            const resp = await api.patch(`bloques/${bloque.id}/modificar_bloque/`, payload);
            
            setBloques(prevBloques => 
                prevBloques.map(b => b.id === bloque.id ? resp.data : b)
            );
            
            alert('¡Bloque actualizado permanentemente!');
            
        } catch (error) {
            console.error("Error del servidor:", error.response);
            alert('Error al actualizar: ' + (error.response?.data?.error || 'Revisa la consola.'));
        } finally {
            setGuardandoBloqueId(null);
        }
    };

    const eliminarBloque = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este bloque? Se cancelarán las reservas de los alumnos inscritos.")) {
            try {
                await api.delete(`bloques/${id}/`);
                alert("Bloque eliminado correctamente.");
                setBloques(bloques.filter(b => b.id !== id));
            } catch (error) {
                alert("Error al eliminar el bloque.");
            }
        }
    };

    // --- LÓGICA DE AGRUPACIÓN POR DÍAS (ACORDEÓN) ---
    const bloquesAgrupados = bloques.reduce((acc, bloque) => {
        if (!acc[bloque.fecha]) acc[bloque.fecha] = [];
        acc[bloque.fecha].push(bloque);
        return acc;
    }, {});

    const fechasOrdenadas = Object.keys(bloquesAgrupados).sort();

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold">Cargando panel...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6 max-w-6xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[#003057]">Gestión de Horarios</h2>
                    <p className="text-gray-600 font-medium mt-1">Controla la apertura del gimnasio, asigna coaches y modifica los aforos.</p>
                </div>

                {/* ========================================== */}
                {/* INTERRUPTOR MAESTRO */}
                {/* ========================================== */}
                <div className={`mb-8 p-6 rounded-xl shadow-md border-t-4 transition-colors ${config.gimnasio_abierto ? 'bg-white border-green-500' : 'bg-red-50 border-red-600'}`}>
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                        ⚙️ Interruptor Maestro del Gimnasio
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={config.gimnasio_abierto}
                                onChange={(e) => setConfig({...config, gimnasio_abierto: e.target.checked})}
                            />
                            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                            <span className={`ml-3 font-bold text-lg ${config.gimnasio_abierto ? 'text-green-700' : 'text-red-600'}`}>
                                {config.gimnasio_abierto ? 'ABIERTO (Normal)' : 'CERRADO (Modo Vacaciones)'}
                            </span>
                        </label>

                        {!config.gimnasio_abierto && (
                            <input 
                                type="text" 
                                className="flex-1 border-2 border-red-200 bg-white p-2 rounded outline-none w-full font-medium"
                                placeholder="Motivo del cierre (Ej: Cerrado por Vacaciones de Invierno)"
                                value={config.mensaje_cierre}
                                onChange={(e) => setConfig({...config, mensaje_cierre: e.target.value})}
                            />
                        )}

                        <button 
                            onClick={guardarConfiguracion}
                            disabled={guardandoConfig}
                            className="bg-[#003057] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 transition shadow-md whitespace-nowrap"
                        >
                            {guardandoConfig ? 'Guardando...' : 'Aplicar Cambios'}
                        </button>
                    </div>
                </div>

                {/* ========================================== */}
                {/* VISTA DE ACORDEÓN DE BLOQUES */}
                {/* ========================================== */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">Planificación de la Semana</h3>
                    
                    {fechasOrdenadas.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-md text-center border-2 border-dashed border-gray-300">
                            <p className="text-xl text-gray-500 font-bold">No hay bloques generados en este momento.</p>
                        </div>
                    ) : (
                        fechasOrdenadas.map(fecha => {
                            const fechaObj = new Date(`${fecha}T00:00:00`);
                            const diaSemana = fechaObj.toLocaleDateString('es-CL', { weekday: 'long' });
                            const fechaFormateada = fechaObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
                            
                            const estaExpandido = diaExpandido === fecha;
                            const bloquesDelDia = bloquesAgrupados[fecha];

                            return (
                                <div key={fecha} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                                    <button 
                                        onClick={() => setDiaExpandido(estaExpandido ? null : fecha)}
                                        className={`w-full flex justify-between items-center p-5 transition-colors ${
                                            estaExpandido ? 'bg-[#003057] text-white' : 'bg-white hover:bg-gray-50 text-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{estaExpandido ? '🔽' : '▶️'}</span>
                                            <h4 className="text-xl font-black capitalize">
                                                {diaSemana}, <span className="font-normal">{fechaFormateada}</span>
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                estaExpandido ? 'bg-white text-[#003057]' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {bloquesDelDia.length} Módulos
                                            </span>
                                        </div>
                                    </button>

                                    {estaExpandido && (
                                        <div className="p-1 sm:p-5 bg-gray-50">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left bg-white rounded-lg overflow-hidden shadow-sm">
                                                    <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
                                                        <tr>
                                                            <th className="p-4 font-black">Módulo / Hora</th>
                                                            <th className="p-4 font-black">Entrenador</th>
                                                            <th className="p-4 font-black text-center w-24">Aforo</th>
                                                            <th className="p-4 font-black text-center">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {bloquesDelDia.map(b => (
                                                            <tr key={b.id} className="hover:bg-blue-50 transition">
                                                                <td className="p-4">
                                                                    <p className="font-black text-[#FFC72C] text-lg">MÓDULO {b.codigo_bloque?.replace('B', '')}</p>
                                                                    <p className="text-sm text-gray-600 font-medium">{b.hora_inicio.substring(0,5)} - {b.hora_fin.substring(0,5)}</p>
                                                                </td>

                                                                <td className="p-4">
                                                                    <select 
                                                                        className="w-full border-2 border-gray-200 p-2 rounded outline-none focus:border-[#003057] transition font-medium"
                                                                        /* AQUÍ: Usamos entrenador_a_cargo */
                                                                        value={b.entrenador_a_cargo || ''}
                                                                        onChange={(e) => handleChangeBloque(b.id, 'entrenador_a_cargo', e.target.value)}
                                                                    >
                                                                        <option value="">-- Sin Asignar --</option>
                                                                        {entrenadores.map(ent => (
                                                                            <option key={ent.id} value={ent.id}>
                                                                                {ent.first_name} {ent.last_name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </td>

                                                                <td className="p-4 text-center">
                                                                    <input 
                                                                        type="number" 
                                                                        min="1"
                                                                        className="w-20 border-2 border-gray-200 p-2 rounded text-center outline-none focus:border-[#003057] font-bold"
                                                                        value={b.aforo_regular}
                                                                        onChange={(e) => handleChangeBloque(b.id, 'aforo_regular', e.target.value)}
                                                                    />
                                                                </td>

                                                                <td className="p-4 text-center">
                                                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                                                        <button 
                                                                            onClick={() => actualizarBloque(b)}
                                                                            disabled={guardandoBloqueId === b.id}
                                                                            className="bg-green-100 text-green-700 px-3 py-2 rounded font-bold hover:bg-green-200 transition whitespace-nowrap"
                                                                        >
                                                                            {guardandoBloqueId === b.id ? '⏳...' : '💾 Guardar'}
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => eliminarBloque(b.id)}
                                                                            className="bg-red-100 text-red-700 px-3 py-2 rounded font-bold hover:bg-red-200 transition"
                                                                            title="Eliminar Módulo"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}