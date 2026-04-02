import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Home() {
    const [bloques, setBloques] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Primero verificamos el rol del usuario antes de cargar nada
        api.get('usuarios/me/')
            .then(res => {
                if (res.data.rol >= 2) {
                    // Si es Entrenador o Admin, lo expulsamos del Home de alumnos
                    navigate('/admin/bloques', { replace: true });
                } else {
                    // Si es alumno, cargamos los bloques para que pueda reservar
                    cargarBloques();
                }
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [navigate]);

    const cargarBloques = async () => {
        try {
            const resp = await api.get('bloques/');
            setBloques(resp.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const reservar = async (id) => {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            await api.post('reservas/', { bloque: id, fecha_especifica: hoy });
            alert('¡Reserva exitosa!');
            cargarBloques();
        } catch (e) {
            alert(e.response?.data?.error || 'Error');
        }
    };

    // Si está cargando o redireccionando, mostramos una pantalla limpia
    if (isLoading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extrabold text-[#003057]">Horarios Disponibles</h2>
                    <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-bold">Hoy: {new Date().toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bloques.map((b) => (
                        <div key={b.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border-t-8 border-[#003057]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{b.dia}</h3>
                                    <p className="text-[#FFC72C] font-black text-lg">MÓDULO {b.codigo_bloque?.replace('B', '')}</p>
                                    <p className="text-gray-500 font-medium italic">{b.hora_inicio.substring(0, 5)} - {b.hora_fin.substring(0, 5)}</p>
                                </div>
                                <div className={`text-right ${b.cupos_disponibles > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    <p className="text-3xl font-black">{b.cupos_disponibles}</p>
                                    <p className="text-xs font-bold uppercase">Cupos</p>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4 mb-6">
                                <p className="text-sm text-gray-600">Entrenador: <span className="font-bold">{b.entrenador_nombre || 'Por asignar'}</span></p>
                            </div>

                            <button
                                onClick={() => reservar(b.id)}
                                disabled={b.cupos_disponibles === 0}
                                className={`w-full py-3 rounded-lg font-black uppercase tracking-widest transition ${b.cupos_disponibles > 0
                                        ? 'bg-[#003057] text-white hover:bg-blue-900'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {b.cupos_disponibles > 0 ? 'Reservar Ahora' : 'Agotado'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}