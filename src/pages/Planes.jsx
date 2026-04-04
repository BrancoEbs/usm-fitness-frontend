import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Planes() {
    const [planes, setPlanes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cargarPlanes();
    }, []);

    const cargarPlanes = async () => {
        try {
            // ¡La magia del Backend!: Django lee tu token y solo te devuelve 
            // los planes Globales y los que te asignaron personalmente.
            const res = await api.get('planes/');
            setPlanes(res.data);
        } catch (error) {
            console.error("Error al cargar los planes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold">Cargando tus rutinas...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6 max-w-6xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[#003057]">Mis Rutinas de Entrenamiento</h2>
                    <p className="text-gray-600 mt-2">Aquí verás los planes globales y los que tu entrenador ha diseñado exclusivamente para ti.</p>
                </div>

                {planes.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md text-center border-2 border-dashed border-gray-300">
                        <p className="text-xl text-gray-500 font-bold">Aún no tienes rutinas asignadas.</p>
                        <p className="text-gray-400 mt-2">Pídele a tu entrenador que diseñe un plan para ti.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {planes.map(plan => (
                            <div key={plan.id} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border-t-8 border-[#003057]">
                                {/* Encabezado de la Rutina */}
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl md:text-3xl font-black text-gray-800">{plan.titulo}</h3>
                                            {plan.es_global ? (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Plan Global </span>
                                            ) : (
                                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Plan Personal </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Diseñado por: <span className="font-bold text-[#003057]">{plan.creado_por_nombre || 'USM Fitness'}</span> | 
                                            Válido hasta: {new Date(`${plan.fecha_vencimiento}T00:00:00`).toLocaleDateString('es-CL')}
                                        </p>
                                    </div>
                                </div>

                                {/* Lista de Ejercicios */}
                                {plan.rutina_interactiva?.length === 0 ? (
                                    <p className="text-gray-400 italic bg-gray-50 p-4 rounded text-center">El entrenador aún no ha añadido ejercicios a este plan.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {plan.rutina_interactiva.map((detalle, index) => (
                                            <div key={detalle.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition relative overflow-hidden">
                                                
                                                {/* Etiqueta del Grupo Muscular */}
                                                <div className="absolute top-0 right-0 bg-[#FFC72C] text-[#003057] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                                                    {detalle.ejercicio_detalle.grupo_muscular}
                                                </div>

                                                <div className="flex gap-3 items-start mb-4 mt-2">
                                                    <span className="bg-[#003057] text-white w-8 h-8 flex flex-shrink-0 justify-center items-center rounded text-sm font-black shadow-sm">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{detalle.ejercicio_detalle.nombre}</h4>
                                                    </div>
                                                </div>

                                                {/* Cuadro de Series / Reps / Descanso */}
                                                <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm mt-4">
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Series</p>
                                                        <p className="font-black text-[#003057] text-xl">{detalle.series}</p>
                                                    </div>
                                                    <div className="border-x border-gray-100">
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Reps</p>
                                                        <p className="font-black text-[#003057] text-xl">{detalle.repeticiones}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Descanso</p>
                                                        <p className="font-black text-[#003057] text-xl">{detalle.descanso_segundos}s</p>
                                                    </div>
                                                </div>

                                                {detalle.ejercicio_detalle.video_url && (
                                                    <a href={detalle.ejercicio_detalle.video_url} target="_blank" rel="noreferrer" 
                                                       className="block text-center bg-blue-100 text-blue-800 text-xs font-bold mt-4 py-2 rounded hover:bg-blue-200 transition">
                                                        ▶ Ver Video Tutorial
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}