import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

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
        try {
            const payload = {
                ...nuevoPlan,
                // Si es global, enviamos null en el alumno. Si no, enviamos el ID.
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

                {/* ========================================== */}
                {/* VISTA 1: CATÁLOGO DE EJERCICIOS    */}
                {/* ========================================== */}
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
                                <button type="submit" className="w-full bg-[#003057] text-white font-bold py-2 rounded">Guardar Ejercicio</button>
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


                {/* ========================================== */}
                {/* VISTA 2: PLANES DE ENTRENAMIENTO      */}
                {/* ========================================== */}
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
                                        <label className="block text-sm font-bold text-gray-700">Asignar a Alumno</label>
                                        <select required className="w-full border p-2 rounded mt-1"
                                            value={nuevoPlan.alumno_asignado} onChange={e => setNuevoPlan({...nuevoPlan, alumno_asignado: e.target.value})}>
                                            <option value="">Seleccionar Alumno...</option>
                                            {alumnos.map(al => (
                                                <option key={al.id} value={al.id}>{al.first_name} {al.last_name} ({al.username})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Fecha de Vencimiento</label>
                                    <input type="date" required className="w-full border p-2 rounded mt-1"
                                        value={nuevoPlan.fecha_vencimiento} onChange={e => setNuevoPlan({...nuevoPlan, fecha_vencimiento: e.target.value})} />
                                </div>

                                <button type="submit" className="w-full bg-[#FFC72C] text-[#003057] font-black py-2 rounded">Crear Plan Vacío</button>
                            </form>
                        </div>

                        {/* Gestor de Ejercicios del Plan */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Selector de Plan a Editar */}
                            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
                                <label className="font-bold text-gray-700 whitespace-nowrap">Editar Rutina de:</label>
                                <select 
                                    className="w-full border-2 border-gray-200 p-2 rounded outline-none font-bold"
                                    onChange={(e) => setPlanSeleccionado(planes.find(p => p.id === parseInt(e.target.value)) || null)}
                                    value={planSeleccionado?.id || ""}
                                >
                                    <option value="">-- Selecciona un plan creado para agregarle ejercicios --</option>
                                    {planes.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.es_global ? '🌍 GLOBAL - ' : '👤 PERSONAL - '} {p.titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Constructor de Rutinas (Solo aparece si hay un plan seleccionado) */}
                            {planSeleccionado && (
                                <div className="bg-white p-6 rounded-xl shadow-md border-2 border-[#003057]">
                                    <h3 className="text-2xl font-black text-[#003057] mb-2">{planSeleccionado.titulo}</h3>
                                    
                                    {/* Formulario para agregar ejercicio a este plan */}
                                    <form onSubmit={agregarEjercicioAPlan} className="bg-gray-50 p-4 rounded-lg border flex flex-wrap gap-4 items-end mb-6">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Ejercicio del Catálogo</label>
                                            <select required className="w-full border p-2 rounded bg-white mt-1"
                                                value={detalleRutina.ejercicio} onChange={e => setDetalleRutina({...detalleRutina, ejercicio: e.target.value})}>
                                                <option value="">Seleccionar...</option>
                                                {ejercicios.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre} ({ej.grupo_muscular})</option>)}
                                            </select>
                                        </div>
                                        <div className="w-20">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Series</label>
                                            <input type="number" required min="1" className="w-full border p-2 rounded mt-1 bg-white"
                                                value={detalleRutina.series} onChange={e => setDetalleRutina({...detalleRutina, series: e.target.value})} />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Reps</label>
                                            <input type="text" required placeholder="Ej: 10-12" className="w-full border p-2 rounded mt-1 bg-white"
                                                value={detalleRutina.repeticiones} onChange={e => setDetalleRutina({...detalleRutina, repeticiones: e.target.value})} />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Desc(s)</label>
                                            <input type="number" required step="10" className="w-full border p-2 rounded mt-1 bg-white"
                                                value={detalleRutina.descanso_segundos} onChange={e => setDetalleRutina({...detalleRutina, descanso_segundos: e.target.value})} />
                                        </div>
                                        <button type="submit" className="bg-[#003057] text-white font-bold py-2 px-4 rounded hover:bg-blue-900">+</button>
                                    </form>

                                    {/* Ejercicios actuales del plan (La magia del Serializer anidado) */}
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-gray-700 border-b pb-2">Ejercicios en esta Rutina:</h4>
                                        {planSeleccionado.rutina_interactiva?.length === 0 && <p className="text-gray-400 italic text-sm">El plan está vacío. Agrega ejercicios arriba.</p>}
                                        
                                        {/* Buscamos el plan actualizado dentro de 'planes' porque tiene la rutina anidada */}
                                        {planes.find(p => p.id === planSeleccionado.id)?.rutina_interactiva.map((detalle, index) => (
                                            <div key={detalle.id} className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-[#003057] text-white w-8 h-8 flex justify-center items-center rounded-full font-bold">{index + 1}</div>
                                                    <div>
                                                        <p className="font-bold text-[#003057]">{detalle.ejercicio_detalle.nombre}</p>
                                                        <p className="text-xs text-gray-600">{detalle.series} series x {detalle.repeticiones} reps | {detalle.descanso_segundos}s desc.</p>
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