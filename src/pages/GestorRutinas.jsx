import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function GestorRutinas() {
    const [ejercicios, setEjercicios] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [alumnos, setAlumnos] = useState([]);

    // Estados de los formularios
    const [formEjercicio, setFormEjercicio] = useState({ nombre: '', grupo_muscular: '', descripcion: '', video_url: '' });
    const [formPlan, setFormPlan] = useState({ titulo: '', es_global: false, alumno_asignado: '', fecha_vencimiento: '' });
    const [formDetalle, setFormDetalle] = useState({ plan: '', ejercicio: '', series: 4, repeticiones: '10-12', descanso_segundos: 60, notas: '' });

    const cargarDatos = async () => {
        try {
            const [resEjer, resPlanes, resUsuarios] = await Promise.all([
                api.get('ejercicios/'),
                api.get('planes/'),
                api.get('usuarios/')
            ]);
            setEjercicios(resEjer.data);
            setPlanes(resPlanes.data);
            setAlumnos(resUsuarios.data.filter(u => u.rol === 1)); // Solo alumnos
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    // 1. Crear Ejercicio
    const crearEjercicio = async (e) => {
        e.preventDefault();
        try {
            await api.post('ejercicios/', formEjercicio);
            alert('Ejercicio creado');
            setFormEjercicio({ nombre: '', grupo_muscular: '', descripcion: '', video_url: '' });
            cargarDatos();
        } catch (error) { alert('Error al crear ejercicio'); }
    };

    // 2. Crear Plan
    const crearPlan = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formPlan };
            if (data.es_global) data.alumno_asignado = null; // Si es global, no lleva alumno
            else if (data.alumno_asignado === '') return alert('Selecciona un alumno o marca como Global');

            await api.post('planes/', data);
            alert('Plan creado');
            setFormPlan({ titulo: '', es_global: false, alumno_asignado: '', fecha_vencimiento: '' });
            cargarDatos();
        } catch (error) { alert('Error al crear el plan'); }
    };

    // 3. Asignar Ejercicio al Plan
    const agregarAlPlan = async (e) => {
        e.preventDefault();
        try {
            await api.post('rutinas-detalle/', formDetalle);
            alert('Ejercicio añadido a la rutina');
            setFormDetalle({ ...formDetalle, notas: '' }); // Limpiamos las notas pero dejamos la config
        } catch (error) { alert('Error al añadir el ejercicio'); console.log(error.response.data) }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="container mx-auto p-6 max-w-7xl">
                <h2 className="text-3xl font-bold text-[#003057] mb-6">Gestor de Rutinas (Entrenador)</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* COLUMNA 1: Catálogo de Ejercicios */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 h-fit">
                        <h3 className="font-bold text-lg mb-4 text-blue-800">1. Nuevo Ejercicio</h3>
                        <form onSubmit={crearEjercicio} className="space-y-3">
                            <input type="text" placeholder="Nombre (Ej: Sentadilla)" required
                                className="w-full border p-2 rounded" value={formEjercicio.nombre}
                                onChange={e => setFormEjercicio({ ...formEjercicio, nombre: e.target.value })} />
                            <input type="text" placeholder="Grupo Muscular (Ej: Piernas)" required
                                className="w-full border p-2 rounded" value={formEjercicio.grupo_muscular}
                                onChange={e => setFormEjercicio({ ...formEjercicio, grupo_muscular: e.target.value })} />
                            <input type="url" placeholder="URL Video YouTube (Opcional)"
                                className="w-full border p-2 rounded" value={formEjercicio.video_url}
                                onChange={e => setFormEjercicio({ ...formEjercicio, video_url: e.target.value })} />
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded">Crear Ejercicio</button>
                        </form>
                    </div>

                    {/* COLUMNA 2: Crear Plan (Contenedor) */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500 h-fit">
                        <h3 className="font-bold text-lg mb-4 text-yellow-700">2. Crear Nuevo Plan</h3>
                        <form onSubmit={crearPlan} className="space-y-3">
                            <input type="text" placeholder="Título del Plan" required
                                className="w-full border p-2 rounded" value={formPlan.titulo}
                                onChange={e => setFormPlan({ ...formPlan, titulo: e.target.value })} />

                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                                <input type="checkbox" id="global" checked={formPlan.es_global}
                                    onChange={e => setFormPlan({ ...formPlan, es_global: e.target.checked })} />
                                <label htmlFor="global" className="font-semibold text-gray-700">Plan Global (Para todos)</label>
                            </div>

                            {!formPlan.es_global && (
                                <select className="w-full border p-2 rounded" required value={formPlan.alumno_asignado}
                                    onChange={e => setFormPlan({ ...formPlan, alumno_asignado: e.target.value })}>
                                    <option value="">-- Seleccionar Alumno --</option>
                                    {alumnos.map(al => <option key={al.id} value={al.id}>{al.first_name} {al.last_name}</option>)}
                                </select>
                            )}

                            <input type="date" required className="w-full border p-2 rounded text-gray-600"
                                value={formPlan.fecha_vencimiento} onChange={e => setFormPlan({ ...formPlan, fecha_vencimiento: e.target.value })} />

                            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded">Crear Plan</button>
                        </form>
                    </div>

                    {/* COLUMNA 3: Añadir Ejercicios al Plan */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 h-fit">
                        <h3 className="font-bold text-lg mb-4 text-green-700">3. Armar la Rutina</h3>
                        <form onSubmit={agregarAlPlan} className="space-y-3">

                            <select className="w-full border p-2 rounded font-bold" required value={formDetalle.plan}
                                onChange={e => setFormDetalle({ ...formDetalle, plan: e.target.value })}>
                                <option value="">-- Seleccionar Plan --</option>
                                {planes.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                            </select>

                            <select className="w-full border p-2 rounded" required value={formDetalle.ejercicio}
                                onChange={e => setFormDetalle({ ...formDetalle, ejercicio: e.target.value })}>
                                <option value="">-- Seleccionar Ejercicio --</option>
                                {ejercicios.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre} ({ej.grupo_muscular})</option>)}
                            </select>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Series</label>
                                    <input type="number" className="w-full border p-2 rounded" required value={formDetalle.series}
                                        onChange={e => setFormDetalle({ ...formDetalle, series: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Reps</label>
                                    <input type="text" className="w-full border p-2 rounded" required value={formDetalle.repeticiones}
                                        onChange={e => setFormDetalle({ ...formDetalle, repeticiones: e.target.value })} />
                                </div>
                            </div>

                            <input type="text" placeholder="Notas (Ej: Cuidar espalda)" className="w-full border p-2 rounded"
                                value={formDetalle.notas} onChange={e => setFormDetalle({ ...formDetalle, notas: e.target.value })} />

                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded">Añadir al Plan</button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}