import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Asistencia() {
    const [bloques, setBloques] = useState([]);
    const [bloqueSeleccionado, setBloqueSeleccionado] = useState('');
    const [alumnos, setAlumnos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Cargamos los bloques disponibles
    useEffect(() => {
        const fetchBloques = async () => {
            try {
                const resp = await api.get('bloques/');
                setBloques(resp.data);
            } catch (error) {
                console.error("Error cargando bloques", error);
            }
        };
        fetchBloques();
    }, []);

    // 2. Cargamos los alumnos cuando el entrenador elige un bloque
    useEffect(() => {
        if (!bloqueSeleccionado) {
            setAlumnos([]);
            return;
        }

        const fetchAlumnos = async () => {
            setIsLoading(true);
            try {
                // Llama a la ruta personalizada que hicimos en Django
                const resp = await api.get(`bloques/${bloqueSeleccionado}/reservas_hoy/`);
                setAlumnos(resp.data);
            } catch (error) {
                console.error("Error cargando la lista", error);
                alert("Error al cargar la lista. Verifica tus permisos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlumnos();
    }, [bloqueSeleccionado]);

    // 3. Función para castigar o salvar al alumno
    const marcarAsistencia = async (reservaId, estado) => {
        try {
            await api.post(`reservas/${reservaId}/marcar_asistencia/`, { estado });

            // Actualizamos la lista local para que el botón cambie al instante
            setAlumnos(alumnos.map(al =>
                al.id === reservaId ? { ...al, estado } : al
            ));
        } catch (error) {
            alert("Error al guardar asistencia. Puede que ya haya sido marcada.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="container mx-auto p-6 max-w-4xl">
                <h2 className="text-3xl font-bold text-[#003057] mb-6">Control de Asistencia</h2>

                {/* Selector de Bloque */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <label className="block text-gray-700 font-bold mb-2">Selecciona el bloque de hoy:</label>
                    <select
                        value={bloqueSeleccionado}
                        onChange={(e) => setBloqueSeleccionado(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003057] focus:outline-none"
                    >
                        <option value="">-- Elige un horario --</option>
                        {bloques.map(bloque => (
                            <option key={bloque.id} value={bloque.id}>
                                {bloque.dia} | {bloque.hora_inicio.substring(0, 5)} - {bloque.hora_fin.substring(0, 5)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lista de Alumnos */}
                {isLoading ? (
                    <div className="text-center text-xl text-gray-600">Cargando lista...</div>
                ) : bloqueSeleccionado && alumnos.length === 0 ? (
                    <div className="text-center text-xl text-gray-600 bg-white p-6 rounded shadow">
                        Nadie ha reservado para este bloque hoy.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {alumnos.map((reserva) => (
                            <div key={reserva.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-center border-l-4 border-blue-500">
                                <div className="mb-4 md:mb-0 text-center md:text-left">
                                    <h3 className="text-lg font-bold text-gray-800">{reserva.alumno_nombre}</h3>
                                    <p className="text-sm text-gray-500">Estado actual: <span className="font-semibold">{reserva.estado}</span></p>
                                </div>

                                {/* Botones de Acción */}
                                <div className="flex gap-2">
                                    {reserva.estado === 'PEN' ? (
                                        <>
                                            <button
                                                onClick={() => marcarAsistencia(reserva.id, 'PRE')}
                                                className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2 px-6 rounded border border-green-300 transition"
                                            >
                                                ✓ Presente
                                            </button>
                                            <button
                                                onClick={() => marcarAsistencia(reserva.id, 'AUS')}
                                                className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-6 rounded border border-red-300 transition"
                                            >
                                                ✗ Ausente
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`py-2 px-6 rounded font-bold ${reserva.estado === 'PRE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {reserva.estado === 'PRE' ? 'Asistió' : 'Faltó'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}