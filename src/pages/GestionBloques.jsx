import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const BLOQUES_USM = [
    { id: 'B1', label: 'Bloque 1 (08:15 - 09:25)' },
    { id: 'B2', label: 'Bloque 2 (09:40 - 10:50)' },
    { id: 'B3', label: 'Bloque 3 (11:05 - 12:15)' },
    { id: 'B4', label: 'Bloque 4 (12:30 - 13:40)' },
    { id: 'B5', label: 'Bloque 5 (14:40 - 15:50)' },
    { id: 'B6', label: 'Bloque 6 (16:05 - 17:15)' },
    { id: 'B7', label: 'Bloque 7 (17:30 - 18:40)' },
    { id: 'B8', label: 'Bloque 8 (18:55 - 20:05)' },
];

const DIAS = [
    { id: 'LU', label: 'Lunes' },
    { id: 'MA', label: 'Martes' },
    { id: 'MI', label: 'Miércoles' },
    { id: 'JU', label: 'Jueves' },
    { id: 'VI', label: 'Viernes' },
    { id: 'SA', label: 'Sábado' },
];

export default function GestionBloques() {
    const [bloques, setBloques] = useState([]);
    const [entrenadores, setEntrenadores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        dia: 'LU',
        codigo_bloque: 'B1',
        aforo_regular: 20,
        entrenador_a_cargo: ''
    });

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [resB, resU] = await Promise.all([api.get('bloques/'), api.get('usuarios/')]);
            setBloques(resB.data);
            setEntrenadores(resU.data.filter(u => u.rol === 2));
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    const crearBloque = async (e) => {
        e.preventDefault();
        try {
            await api.post('bloques/', formData);
            alert('Bloque creado');
            cargarDatos();
        } catch (error) { alert('Error al crear bloque'); }
    };

    const eliminarBloque = async (id) => {
        if (!window.confirm('¿Eliminar bloque?')) return;
        try {
            await api.delete(`bloques/${id}/`);
            cargarDatos();
        } catch (error) { alert('Error'); }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto p-6 max-w-6xl">
                <h2 className="text-3xl font-bold text-red-700 mb-6">Gestión de Horarios USM</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Formulario */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-700 h-fit">
                        <h3 className="font-bold mb-4">Nuevo Bloque</h3>
                        <form onSubmit={crearBloque} className="space-y-4">
                            <select name="dia" value={formData.dia} onChange={e => setFormData({ ...formData, dia: e.target.value })} className="w-full border p-2 rounded">
                                {DIAS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                            </select>
                            <select name="codigo_bloque" value={formData.codigo_bloque} onChange={e => setFormData({ ...formData, codigo_bloque: e.target.value })} className="w-full border p-2 rounded font-bold">
                                {BLOQUES_USM.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                            </select>
                            <input type="number" placeholder="Aforo" value={formData.aforo_regular} onChange={e => setFormData({ ...formData, aforo_regular: e.target.value })} className="w-full border p-2 rounded" />
                            <select value={formData.entrenador_a_cargo} onChange={e => setFormData({ ...formData, entrenador_a_cargo: e.target.value })} className="w-full border p-2 rounded">
                                <option value="">-- Entrenador --</option>
                                {entrenadores.map(ent => <option key={ent.id} value={ent.id}>{ent.first_name}</option>)}
                            </select>
                            <button className="w-full bg-red-700 text-white font-bold py-2 rounded">+ Agregar</button>
                        </form>
                    </div>

                    {/* Lista */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bloques.map(b => (
                            <div key={b.id} className="bg-white p-4 rounded shadow border-l-4 border-[#003057] flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-[#003057]">{b.dia} - {b.codigo_bloque}</p>
                                    <p className="text-sm text-gray-600">{b.hora_inicio.substring(0, 5)} a {b.hora_fin.substring(0, 5)}</p>
                                </div>
                                <button onClick={() => eliminarBloque(b.id)} className="text-red-500">Eliminar</button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}