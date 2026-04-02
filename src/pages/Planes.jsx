import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Planes() {
    const [planes, setPlanes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [planExpandido, setPlanExpandido] = useState(null); // Controla qué plan está abierto

    useEffect(() => {
        cargarPlanes();
    }, []);

    const cargarPlanes = async () => {
        try {
            const resp = await api.get('planes/');
            setPlanes(resp.data);
        } catch (error) {
            console.error("Error cargando planes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlan = (id) => {
        if (planExpandido === id) {
            setPlanExpandido(null); // Si ya está abierto, lo cerramos
        } else {
            setPlanExpandido(id); // Abrimos el nuevo
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="container mx-auto p-6 max-w-4xl">
                <h2 className="text-3xl font-bold text-[#003057] mb-6">Mis Rutinas de Entrenamiento</h2>

                {isLoading ? (
                    <div className="text-center text-xl text-gray-600 mt-10">Cargando rutinas...</div>
                ) : planes.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
                        No tienes planes de entrenamiento asignados en este momento.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {planes.map((plan) => (
                            <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-[#FFC72C]">

                                {/* Cabecera del Plan (Clickeable) */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition"
                                    onClick={() => togglePlan(plan.id)}
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{plan.titulo}</h3>
                                        <p className="text-sm text-gray-500">
                                            Vence el: {plan.fecha_vencimiento} | Entrenador: {plan.creado_por_nombre || 'USM'}
                                        </p>
                                    </div>
                                    <div className="text-[#003057] font-bold text-xl">
                                        {planExpandido === plan.id ? '−' : '+'}
                                    </div>
                                </div>

                                {/* Contenido del Plan (Ejercicios) */}
                                {planExpandido === plan.id && (
                                    <div className="p-4 bg-gray-50 border-t">
                                        <h4 className="font-bold text-[#003057] mb-4">Ejercicios de la Rutina:</h4>

                                        {plan.rutina_interactiva.length === 0 ? (
                                            <p className="text-gray-500 italic">Este plan aún no tiene ejercicios detallados.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {plan.rutina_interactiva.map((detalle) => (
                                                    <div key={detalle.id} className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                                        <h5 className="font-bold text-lg text-gray-800">{detalle.ejercicio_detalle.nombre}</h5>
                                                        <p className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                                                            {detalle.ejercicio_detalle.grupo_muscular}
                                                        </p>

                                                        <ul className="text-sm text-gray-600 space-y-1 mb-3">
                                                            <li><strong>Series:</strong> {detalle.series}</li>
                                                            <li><strong>Repeticiones:</strong> {detalle.repeticiones}</li>
                                                            <li><strong>Descanso:</strong> {detalle.descanso_segundos} seg</li>
                                                        </ul>

                                                        {detalle.notas && (
                                                            <p className="text-sm text-gray-500 italic bg-yellow-50 p-2 rounded">
                                                                Nota: {detalle.notas}
                                                            </p>
                                                        )}

                                                        {detalle.ejercicio_detalle.video_url && (
                                                            <a
                                                                href={detalle.ejercicio_detalle.video_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block mt-3 text-sm font-bold text-red-600 hover:text-red-800 transition"
                                                            >
                                                                ▶ Ver video tutorial
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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