import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

// =====================================================================
// COMPONENTE AUXILIAR: BUSCADOR INTELIGENTE (Dropdown con buscador)
// =====================================================================
const BuscadorInteligente = ({ opciones, valor, alCambiar, placeholder, className }) => {
    const [busqueda, setBusqueda] = useState('');
    const [abierto, setAbierto] = useState(false);

    const opcionSeleccionada = opciones.find(opt => opt.id === valor);
    const opcionesFiltradas = opciones.filter(opt =>
        opt.texto.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="relative w-full">
            {/* Overlay invisible: Si haces clic afuera, se cierra el menú */}
            {abierto && <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)}></div>}
            
            <div 
                className={`${className} cursor-pointer flex justify-between items-center relative z-20`}
                onClick={() => setAbierto(!abierto)}
            >
                <span className={`truncate ${opcionSeleccionada ? 'text-gray-800' : 'text-gray-400 font-normal'}`}>
                    {opcionSeleccionada ? opcionSeleccionada.texto : placeholder}
                </span>
                <span className="text-gray-400 text-sm ml-2">{abierto ? '▲' : '▼'}</span>
            </div>

            {abierto && (
                <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#003057] rounded-lg shadow-2xl max-h-72 flex flex-col overflow-hidden">
                    <div className="p-2 bg-gray-50 border-b border-gray-200">
                        <input
                            type="text"
                            autoFocus
                            className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#FFC72C] transition text-sm"
                            placeholder="🔍 Escribe para buscar..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto">
                        <div 
                            className="p-3 text-sm text-red-500 font-bold hover:bg-red-50 cursor-pointer border-b border-gray-100"
                            onClick={() => { alCambiar(''); setAbierto(false); setBusqueda(''); }}
                        >
                            ✖ Quitar selección
                        </div>
                        {opcionesFiltradas.length > 0 ? (
                            opcionesFiltradas.map(opt => (
                                <div
                                    key={opt.id}
                                    className="p-3 text-sm text-gray-700 hover:bg-[#003057] hover:text-white cursor-pointer transition border-b border-gray-50 last:border-0"
                                    onClick={() => { alCambiar(opt.id); setAbierto(false); setBusqueda(''); }}
                                >
                                    {opt.texto}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-gray-500 text-center italic">No se encontraron resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
// =====================================================================

export default function GestorRutinas() {
    const [activeTab, setActiveTab] = useState('ejercicios'); // 'ejercicios' o 'planes'
    
    // Estados de Datos
    const [ejercicios, setEjercicios] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [alumnos, setAlumnos] = useState([]);

    // Formularios
    const [nuevoEjercicio, setNuevoEjercicio] = useState({ nombre: '', grupo_muscular: '', descripcion: '', video_url: '' });
    const [nuevoPlan, setNuevoPlan] = useState({ titulo: '', es_global: false, alumno_asignado: '', fecha_vencimiento: '' });
    
    // Estado para agregar ejercicios a un plan específico
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [detalleRutina, setDetalleRutina] = useState({ ejercicio: '', series: 3, repeticiones: '10', descanso_segundos: 60, notas: '' });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resEj, resPlanes, resUsuarios] = await Promise.all([
                api.get('ejercicios/'),
                api.get('planes/'),
                api.get('usuarios/')
            ]);
            setEjercicios(resEj.data);
            setPlanes(resPlanes.data);
            setAlumnos(resUsuarios.data.filter(u => u.rol === 1)); // Solo alumnos
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    // --- FUNCIONES CATÁLOGO DE EJERCICIOS ---
    const crearEjercicio = async (e) => {
        e.preventDefault();
        try {
            await api.post('ejercicios/', nuevoEjercicio);
            alert('Ejercicio guardado en el catálogo.');
            setNuevoEjercicio({ nombre: '', grupo_muscular: '', descripcion: '', video_url: '' });
            cargarDatos();
        } catch (error) {
            alert("Error al crear ejercicio.");
        }
    };

    // --- FUNCIONES PLANES DE ENTRENAMIENTO ---
    const crearPlan = async (e) => {
        e.preventDefault();

        // Pequeña validación manual porque quitamos el select nativo
        if (!nuevoPlan.es_global && !nuevoPlan.alumno_asignado) {
            alert("Debes seleccionar un alumno para asignarle este plan.");
            return;
        }

        try {
            const payload = {
                ...nuevoPlan,
                alumno_asignado: nuevoPlan.es_global ? null : nuevoPlan.alumno_asignado
            };
            await api.post('planes/', payload);
            alert('Plan de entrenamiento creado.');
            setNuevoPlan({ titulo: '', es_global: false, alumno_asignado: '', fecha_vencimiento: '' });
            cargarDatos();
        } catch (error) {
            alert("Error al crear el plan.");
        }
    };

    const agregarEjercicioAPlan = async (e) => {
        e.preventDefault();
        try {
            await api.post('detallerutina/', { ...detalleRutina, plan: planSeleccionado.id });
            alert('Ejercicio agregado al plan.');
            setDetalleRutina({ ejercicio: '', series: 3, repeticiones: '10', descanso_segundos: 60, notas: '' });
            cargarDatos(); // Recargamos para ver el ejercicio anidado
        } catch (error) {
            alert("Error al agregar ejercicio a la rutina.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-black text-[#003057]">Laboratorio de Rutinas</h2>
                    
                    {/* TABS (PESTAÑAS) */}
                    <div className="flex bg-white rounded-lg shadow p-1">
                        <button 
                            onClick={() => { setActiveTab('ejercicios'); setPlanSeleccionado(null); }}
                            className={`px-6 py-2 rounded-md font-bold transition ${activeTab === 'ejercicios' ? 'bg-[#003057] text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Catálogo de Ejercicios
                        </button>
                        <button 
                            onClick={() => setActiveTab('planes')}
                            className={`px-6 py-2 rounded-md font-bold transition ${activeTab === 'planes' ? 'bg-[#003057] text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Planes de Entrenamiento
                        </button>
                    </div>
                </div>

                {/* VISTA 1: CATÁLOGO DE EJERCICIOS */}
                {activeTab === 'ejercicios' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Crear Ejercicio */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border-t-4 border-[#FFC72C] h-fit">
                            <h3 className="text-xl font-bold mb-4">Añadir al Catálogo</h3>
                            <form onSubmit={crearEjercicio} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Nombre del Ejercicio</label>
                                    <input type="text" required placeholder="Ej: Press Banca" className="w-full border p-2 rounded mt-1"
                                        value={nuevoEjercicio.nombre} onChange={e => setNuevoEjercicio({...nuevoEjercicio, nombre: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Grupo Muscular</label>
                                    <input type="text" required placeholder="Ej: Pecho" className="w-full border p-2 rounded mt-1"
                                        value={nuevoEjercicio.grupo_muscular} onChange={e => setNuevoEjercicio({...nuevoEjercicio, grupo_muscular: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Link de Video (YouTube)</label>
                                    <input type="url" placeholder="https://..." className="w-full border p-2 rounded mt-1"
                                        value={nuevoEjercicio.video_url} onChange={e => setNuevoEjercicio({...nuevoEjercicio, video_url: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Descripción / Tips</label>
                                    <textarea rows="2" className="w-full border p-2 rounded mt-1 resize-none"
                                        value={nuevoEjercicio.descripcion} onChange={e => setNuevoEjercicio({...nuevoEjercicio, descripcion: e.target.value})}></textarea>
                                </div>
                                <button type="submit" className="w-full bg-[#003057] text-white font-bold py-2 rounded hover:bg-blue-900 transition">Guardar Ejercicio</button>
                            </form>
                        </div>

                        {/* Lista de Ejercicios */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
                            {ejercicios.map(ej => (
                                <div key={ej.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-[#003057]">
                                    <span className="text-xs font-bold text-[#FFC72C] uppercase tracking-wider">{ej.grupo_muscular}</span>
                                    <h4 className="text-lg font-black text-gray-800">{ej.nombre}</h4>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ej.descripcion || 'Sin descripción'}</p>
                                    {ej.video_url && <a href={ej.video_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold mt-2 inline-block hover:underline">▶ Ver Video Tutorial</a>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VISTA 2: PLANES DE ENTRENAMIENTO */}
                {activeTab === 'planes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Crear Nuevo Plan */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border-t-4 border-[#003057] h-fit">
                            <h3 className="text-xl font-bold mb-4">Crear Nuevo Plan</h3>
                            <form onSubmit={crearPlan} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Título del Plan</label>
                                    <input type="text" required placeholder="Ej: Rutina Hipertrofia 3 Días" className="w-full border p-2 rounded mt-1"
                                        value={nuevoPlan.titulo} onChange={e => setNuevoPlan({...nuevoPlan, titulo: e.target.value})} />
                                </div>
                                
                                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded border border-blue-100">
                                    <input type="checkbox" id="es_global" className="w-4 h-4 cursor-pointer"
                                        checked={nuevoPlan.es_global} onChange={e => setNuevoPlan({...nuevoPlan, es_global: e.target.checked})} />
                                    <label htmlFor="es_global" className="text-sm font-bold text-blue-900 cursor-pointer">Es un Plan Global (Para todos)</label>
                                </div>

                                {!nuevoPlan.es_global && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Asignar a Alumno</label>
                                        {/* AQUI APLICAMOS EL BUSCADOR 1 */}
                                        <BuscadorInteligente 
                                            placeholder="Buscar alumno..."
                                            opciones={alumnos.map(al => ({ 
                                                id: al.id, 
                                                texto: `${al.first_name} ${al.last_name} (${al.username})` 
                                            }))}
                                            valor={nuevoPlan.alumno_asignado}
                                            alCambiar={(val) => setNuevoPlan({...nuevoPlan, alumno_asignado: val})}
                                            className="w-full border p-2 rounded mt-1 bg-white"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Fecha de Vencimiento</label>
                                    <input type="date" required className="w-full border p-2 rounded mt-1"
                                        value={nuevoPlan.fecha_vencimiento} onChange={e => setNuevoPlan({...nuevoPlan, fecha_vencimiento: e.target.value})} />
                                </div>

                                <button type="submit" className="w-full bg-[#FFC72C] text-[#003057] font-black py-3 rounded hover:bg-yellow-500 transition shadow-sm">
                                    Crear Plan Vacío
                                </button>
                            </form>
                        </div>

                        {/* Gestor de Ejercicios del Plan */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Selector de Plan a Editar */}
                            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <label className="font-black text-[#003057] whitespace-nowrap text-lg">✏️ Editar Rutina:</label>
                                {/* AQUI APLICAMOS EL BUSCADOR 2 */}
                                <BuscadorInteligente 
                                    placeholder="-- Buscar plan creado para agregarle ejercicios --"
                                    opciones={planes.map(p => ({ 
                                        id: p.id, 
                                        texto: `${p.es_global ? '🌍 GLOBAL -' : '👤 PERSONAL -'} ${p.titulo}` 
                                    }))}
                                    valor={planSeleccionado?.id || ""}
                                    alCambiar={(val) => setPlanSeleccionado(planes.find(p => p.id === parseInt(val)) || null)}
                                    className="w-full border-2 border-gray-200 p-2 rounded outline-none font-bold bg-white"
                                />
                            </div>

                            {/* Constructor de Rutinas */}
                            {planSeleccionado && (
                                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-[#003057]">
                                    <h3 className="text-2xl font-black text-[#003057] mb-2">{planSeleccionado.titulo}</h3>
                                    
                                    <form onSubmit={agregarEjercicioAPlan} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-wrap gap-4 items-end mb-6 shadow-inner">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Ejercicio del Catálogo</label>
                                            <select required className="w-full border p-2 rounded bg-white mt-1 font-medium"
                                                value={detalleRutina.ejercicio} onChange={e => setDetalleRutina({...detalleRutina, ejercicio: e.target.value})}>
                                                <option value="">Seleccionar...</option>
                                                {ejercicios.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre} ({ej.grupo_muscular})</option>)}
                                            </select>
                                        </div>
                                        <div className="w-20">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Series</label>
                                            <input type="number" required min="1" className="w-full border p-2 rounded mt-1 bg-white font-medium text-center"
                                                value={detalleRutina.series} onChange={e => setDetalleRutina({...detalleRutina, series: e.target.value})} />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Reps</label>
                                            <input type="text" required placeholder="Ej: 10-12" className="w-full border p-2 rounded mt-1 bg-white font-medium text-center"
                                                value={detalleRutina.repeticiones} onChange={e => setDetalleRutina({...detalleRutina, repeticiones: e.target.value})} />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Desc(s)</label>
                                            <input type="number" required step="10" className="w-full border p-2 rounded mt-1 bg-white font-medium text-center"
                                                value={detalleRutina.descanso_segundos} onChange={e => setDetalleRutina({...detalleRutina, descanso_segundos: e.target.value})} />
                                        </div>
                                        <button type="submit" className="bg-[#003057] text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-900 transition shadow-md">
                                            Añadir
                                        </button>
                                    </form>

                                    <div className="space-y-3">
                                        <h4 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                                            📋 Ejercicios en esta Rutina
                                        </h4>
                                        {planSeleccionado.rutina_interactiva?.length === 0 && <p className="text-gray-400 italic text-sm">El plan está vacío. Selecciona ejercicios arriba para armar la rutina.</p>}
                                        
                                        {planes.find(p => p.id === planSeleccionado.id)?.rutina_interactiva.map((detalle, index) => (
                                            <div key={detalle.id} className="flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 transition border border-blue-200 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-[#003057] text-[#FFC72C] w-8 h-8 flex justify-center items-center rounded-full font-black shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#003057] text-lg leading-tight">{detalle.ejercicio_detalle.nombre}</p>
                                                        <p className="text-sm font-medium text-gray-600 mt-0.5">
                                                            <span className="font-bold text-gray-800">{detalle.series}</span> series × <span className="font-bold text-gray-800">{detalle.repeticiones}</span> reps | <span className="font-bold text-gray-800">{detalle.descanso_segundos}</span>s desc.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}