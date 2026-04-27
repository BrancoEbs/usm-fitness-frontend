import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MisReservas() {
    const [reservas, setReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            const resp = await api.get('reservas/');
            setReservas(resp.data);
        } catch (error) {
            console.error("Error cargando reservas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelarReserva = async (reservaId) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

        try {
            await api.post(`reservas/${reservaId}/cancelar/`);
            alert('Reserva cancelada exitosamente.');
            cargarReservas(); // Recargamos la lista para ver el cambio de estado
        } catch (error) {
            alert(error.response?.data?.error || 'Error al cancelar la reserva');
        }
    };

    // Función para darle color al estado de la reserva
    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'PEN': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">Pendiente</span>;
            case 'PRE': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">Presente</span>;
            case 'AUS': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">Ausente (Falta)</span>;
            case 'CAN': return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Cancelada</span>;
            default: return <span>{estado}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="container mx-auto p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Mis Reservas</h2>

                {isLoading ? (
                    <div className="text-center text-xl text-gray-600 mt-10">Cargando historial...</div>
                ) : reservas.length === 0 ? (
                    <div className="text-center text-xl text-gray-600 mt-10">No tienes reservas registradas.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reservas.map((reserva) => (
                            <div key={reserva.id} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#003057]">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {reserva.bloque_detalle.dia} | {reserva.bloque_detalle.hora_inicio.substring(0, 5)}
                                        </h3>
                                        <p className="text-sm text-gray-500">Fecha: {reserva.fecha_especifica}</p>
                                    </div>
                                    {getEstadoBadge(reserva.estado)}
                                </div>

                                {/* Si entras como Admin, verás el nombre del alumno. Si entras como alumno normal, no es necesario */}
                                {reserva.alumno_nombre && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        <strong>Alumno:</strong> {reserva.alumno_nombre}
                                    </p>
                                )}

                                <div className="mt-4">
                                    {reserva.estado === 'PEN' ? (
                                        <button
                                            onClick={() => cancelarReserva(reserva.id)}
                                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded transition border border-red-200"
                                        >
                                            Cancelar Reserva
                                        </button>
                                    ) : (
                                        <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-2 rounded cursor-not-allowed">
                                            Ya no se puede cancelar
                                        </button>
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