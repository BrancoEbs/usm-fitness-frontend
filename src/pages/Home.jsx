import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Home() {
    const [bloques, setBloques] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [esSeleccionado, setEsSeleccionado] = useState(false);
    const [configuracion, setConfiguracion] = useState({ gimnasio_abierto: true, mensaje_cierre: '' });
    
    // Estado para saber qué día está abierto en el acordeón
    const [diaExpandido, setDiaExpandido] = useState(null);

    useEffect(() => {
        api.get('usuarios/me/')
            .then(res => {
                setEsSeleccionado(res.data.es_seleccionado);
                
                api.get('configuracion/').then(confRes => {
                    setConfiguracion(confRes.data);
                    
                    if (confRes.data.gimnasio_abierto) {
                        cargarBloques();
                    } else {
                        setIsLoading(false);
                    }
                }).catch(() => setIsLoading(false));

            })
            .catch(() => {
                setIsLoading(false);
            });
    }, []);

    const cargarBloques = async () => {
        try {
            const resp = await api.get('bloques/');
            setBloques(resp.data);
            
            // Expandir automáticamente el primer día que tenga bloques disponibles
            if (resp.data.length > 0) {
                const fechas = [...new Set(resp.data.map(b => b.fecha))].sort();
                setDiaExpandido(fechas[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const reservar = async (id, fechaBloque) => {
        try {
            await api.post('reservas/', { bloque: id, fecha_especifica: fechaBloque });
            alert('¡Reserva exitosa!');
            cargarBloques();
        } catch (e) {
            alert(e.response?.data?.error || 'Error al reservar');
        }
    };

    // --- LÓGICA DE AGRUPACIÓN POR DÍAS ---
    const bloquesAgrupados = bloques.reduce((acc, bloque) => {
        if (!acc[bloque.fecha]) acc[bloque.fecha] = [];
        acc[bloque.fecha].push(bloque);
        return acc;
    }, {});

    const fechasOrdenadas = Object.keys(bloquesAgrupados).sort();

    // PANTALLA 1: Carga
    if (isLoading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold">Cargando plataforma...</div>;

    // PANTALLA 2: Gimnasio Cerrado
    if (!configuracion.gimnasio_abierto) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto p-6 flex justify-center items-center min-h-[70vh]">
                    <div className="bg-red-50 border-2 border-red-200 p-10 md:p-16 rounded-3xl text-center max-w-3xl shadow-xl">
                        <span className="text-7xl block mb-6 drop-shadow-md">⛔</span>
                        <h2 className="text-4xl md:text-5xl font-black text-red-800 mb-6 tracking-tight">Gimnasio Cerrado</h2>
                        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm inline-block">
                            <p className="text-xl md:text-2xl text-red-900 font-medium">
                                {configuracion.mensaje_cierre}
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // PANTALLA 3: Vista Normal
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6 max-w-7xl">
                <div className="flex justify-between items-center mb-8 border-b-2 pb-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#003057]">Reserva de Horarios</h2>
                        <p className="text-gray-600 font-medium mt-1">Selecciona el día y tu módulo de entrenamiento.</p>
                    </div>
                    <span className="hidden sm:inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                         Hoy: {new Date().toLocaleDateString('es-CL')}
                    </span>
                </div>

                {fechasOrdenadas.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-300">
                        <p className="text-2xl font-bold text-gray-400">No hay módulos disponibles por el momento.</p>
                        <p className="text-gray-500 mt-2">Vuelve a revisar más tarde.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {fechasOrdenadas.map(fecha => {
                            const fechaObj = new Date(`${fecha}T00:00:00`);
                            const diaSemana = fechaObj.toLocaleDateString('es-CL', { weekday: 'long' });
                            const fechaFormateada = fechaObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
                            
                            const estaExpandido = diaExpandido === fecha;
                            const bloquesDelDia = bloquesAgrupados[fecha];

                            return (
                                <div key={fecha} className="bg-transparent">
                                    {/* CABECERA DEL ACORDEÓN (ESTILO BOTÓN GRANDE) */}
                                    <button 
                                        onClick={() => setDiaExpandido(estaExpandido ? null : fecha)}
                                        className={`w-full flex justify-between items-center p-5 rounded-xl shadow-sm transition-all duration-300 ${
                                            estaExpandido 
                                                ? 'bg-[#003057] text-white shadow-md' 
                                                : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold text-lg ${estaExpandido ? 'bg-white text-[#003057]' : 'bg-gray-100 text-gray-500'}`}>
                                                {estaExpandido ? '↓' : '→'}
                                            </div>
                                            <h3 className="text-2xl font-black capitalize tracking-tight">
                                                {diaSemana}, <span className="font-medium text-lg opacity-90">{fechaFormateada}</span>
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wide ${
                                                estaExpandido ? 'bg-[#FFC72C] text-[#003057]' : 'bg-blue-50 text-blue-800'
                                            }`}>
                                                {bloquesDelDia.length} Disponibles
                                            </span>
                                        </div>
                                    </button>

                                    {/* CONTENIDO DEL ACORDEÓN (GRILLA DE TARJETAS) */}
                                    {estaExpandido && (
                                        <div className="pt-6 pb-2 px-2 animate-fadeIn">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {bloquesDelDia.map((b) => {
                                                    const isAgotado = b.cupos_disponibles === 0;
                                                    const puedeReservar = !isAgotado || esSeleccionado;

                                                    return (
                                                        <div key={b.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-t-8 border-[#FFC72C] flex flex-col h-full">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <p className="text-[#003057] font-black text-2xl tracking-tight">MÓDULO {b.codigo_bloque?.replace('B', '')}</p>
                                                                    <p className="text-gray-500 font-bold text-sm bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                                                                        ⏰ {b.hora_inicio.substring(0, 5)} - {b.hora_fin.substring(0, 5)}
                                                                    </p>
                                                                </div>
                                                                <div className={`text-center bg-gray-50 p-2 rounded-lg border ${b.cupos_disponibles > 0 ? 'border-green-100' : 'border-red-100'}`}>
                                                                    <p className={`text-3xl font-black leading-none ${b.cupos_disponibles > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {b.cupos_disponibles}
                                                                    </p>
                                                                    <p className="text-[10px] font-black uppercase text-gray-500 mt-1">Cupos</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex-grow mt-4 mb-6">
                                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                                    <span></span> Coach: <span className="font-bold text-gray-800">{b.entrenador_nombre || 'Por asignar'}</span>
                                                                </p>
                                                            </div>

                                                            {/* BOTÓN INTELIGENTE (SOBRECUPOS) */}
                                                            <button
                                                                onClick={() => reservar(b.id, b.fecha)}
                                                                disabled={!puedeReservar}
                                                                className={`w-full py-3 rounded-xl font-black uppercase tracking-wider transition-all shadow-sm ${
                                                                    puedeReservar
                                                                        ? 'bg-[#003057] text-white hover:bg-blue-900 hover:shadow-md active:scale-95'
                                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                {!isAgotado 
                                                                    ? 'Reservar' 
                                                                    : (esSeleccionado ? 'Reservar (Sobrecupo)' : 'Agotado')}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}