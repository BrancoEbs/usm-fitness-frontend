import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Asistencia() {
    const [bloques, setBloques] = useState([]);
    const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [fechaFiltro, setFechaFiltro] = useState(() => {
        // Obtenemos la fecha local de hoy por defecto
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    useEffect(() => {
        cargarBloques();
        // Si cambiamos de fecha, deseleccionamos el bloque actual
        setBloqueSeleccionado(null);
        setReservas([]);
    }, [fechaFiltro]);

    const cargarBloques = async () => {
        try {
            const resp = await api.get('bloques/');
            // Filtramos en el frontend para mostrar solo los de la fecha seleccionada
            const bloquesDelDia = resp.data.filter(b => b.fecha === fechaFiltro);
            setBloques(bloquesDelDia);
        } catch (error) {
            console.error("Error al cargar bloques:", error);
        }
    };

    const verAsistencia = async (bloque) => {
        setBloqueSeleccionado(bloque);
        try {
            const resp = await api.get(`bloques/${bloque.id}/reservas_hoy/`);
            setReservas(resp.data);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
        }
    };

    const registrarAsistencia = async (reservaId, nuevoEstado) => {
        try {
            await api.post(`reservas/${reservaId}/marcar_asistencia/`, { estado: nuevoEstado });
            
            // Actualizamos visualmente la lista sin tener que recargar desde el servidor
            setReservas(reservas.map(res => 
                res.id === reservaId ? { ...res, estado: nuevoEstado } : res
            ));
        } catch (error) {
            alert("Error al registrar la asistencia.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-black text-[#003057]">Control de Asistencia</h2>
                    
                    {/* Buscador por Fecha */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow">
                        <label className="font-bold text-gray-700 ml-2">Fecha:</label>
                        <input 
                            type="date" 
                            className="border p-2 rounded outline-none cursor-pointer"
                            value={fechaFiltro}
                            onChange={(e) => setFechaFiltro(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLUMNA IZQUIERDA: Lista de Bloques */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit border-t-4 border-[#FFC72C]">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2">Módulos del Día</h3>
                        
                        {bloques.length === 0 ? (
                            <p className="text-gray-500 italic">No hay bloques registrados para esta fecha.</p>
                        ) : (
                            <div className="space-y-3">
                                {bloques.map(b => (
                                    <button 
                                        key={b.id}
                                        onClick={() => verAsistencia(b)}
                                        className={`w-full text-left p-4 rounded-lg border transition ${
                                            bloqueSeleccionado?.id === b.id 
                                                ? 'bg-[#003057] text-white border-[#003057]' 
                                                : 'bg-gray-50 hover:bg-blue-50 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-black">MÓDULO {b.codigo_bloque?.replace('B', '')}</span>
                                            <span className="text-sm">{b.hora_inicio.substring(0,5)}</span>
                                        </div>
                                        <p className={`text-sm mt-1 ${bloqueSeleccionado?.id === b.id ? 'text-blue-200' : 'text-gray-500'}`}>
                                            Coach: {b.entrenador_nombre || 'Sin asignar'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Lista de Alumnos (Pase de lista) */}
                    <div className="lg:col-span-2">
                        {bloqueSeleccionado ? (
                            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#003057]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        Pase de Lista: Módulo {bloqueSeleccionado.codigo_bloque?.replace('B', '')}
                                    </h3>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">
                                        {reservas.length} Inscritos
                                    </span>
                                </div>

                                {reservas.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-xl text-gray-400 font-bold">No hay reservas para este módulo.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reservas.map(res => (
                                            <div key={res.id} className="flex flex-col sm:flex-row justify-between items-center p-4 border rounded-lg hover:shadow-md transition bg-gray-50">
                                                <div className="mb-3 sm:mb-0 text-center sm:text-left">
                                                    
                                                    {/* Nombre y Etiqueta de Sobrecupo */}
                                                    <p className="font-bold text-lg flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                                        {res.alumno_nombre.split(' (')[0]}
                                                        {res.es_sobrecupo && (
                                                            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded-full uppercase font-black border border-purple-300">
                                                                ⭐ Sobrecupo
                                                            </span>
                                                        )}
                                                    </p>
                                                    
                                                    <p className="text-sm text-gray-500 font-mono mt-1">
                                                        RUT: {res.alumno_nombre.split(' (')[1]?.replace(')', '')}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => registrarAsistencia(res.id, 'PRE')}
                                                        className={`px-4 py-2 rounded font-bold transition flex items-center gap-2 ${
                                                            res.estado === 'PRE' 
                                                                ? 'bg-green-500 text-white shadow-inner' 
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                    >
                                                        ✅ Presente
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => registrarAsistencia(res.id, 'AUS')}
                                                        className={`px-4 py-2 rounded font-bold transition flex items-center gap-2 ${
                                                            res.estado === 'AUS' 
                                                                ? 'bg-red-500 text-white shadow-inner' 
                                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        ❌ Ausente
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-100 p-12 rounded-xl border-2 border-dashed border-gray-300 text-center h-full flex flex-col justify-center items-center">
                                <p className="text-xl font-bold text-gray-400">Selecciona un bloque a la izquierda para pasar lista.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}