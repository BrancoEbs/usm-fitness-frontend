import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function FichaFisica() {
    const [formData, setFormData] = useState({
        peso_kg: '',
        estatura_cm: '',
        lesiones_previas: '',
        objetivo_principal: ''
    });
    const [observacionesEntrenador, setObservacionesEntrenador] = useState('');
    const [fichaId, setFichaId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // Usamos nuestro endpoint "me" que ya trae la ficha física anidada si existe
            const res = await api.get('usuarios/me/');
            const ficha = res.data.ficha_fisica;

            if (ficha) {
                setFichaId(ficha.id);
                setFormData({
                    peso_kg: ficha.peso_kg || '',
                    estatura_cm: ficha.estatura_cm || '',
                    lesiones_previas: ficha.lesiones_previas || '',
                    objetivo_principal: ficha.objetivo_principal || ''
                });
                setObservacionesEntrenador(ficha.observaciones_entrenador || '');
            }
        } catch (error) {
            console.error("Error al cargar la ficha:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (fichaId) {
                // Si ya existe un ID, actualizamos (PATCH)
                await api.patch(`fichafisica/${fichaId}/`, formData);
                alert('¡Ficha actualizada con éxito!');
            } else {
                // Si no existe, creamos una nueva (POST)
                const res = await api.post('fichafisica/', formData);
                setFichaId(res.data.id);
                alert('¡Ficha creada con éxito!');
            }
        } catch (error) {
            alert('Error al guardar la ficha. Revisa los datos.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold">Cargando tu perfil...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6 max-w-4xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[#003057]">Mi Ficha Física</h2>
                    <p className="text-gray-600 mt-2">Mantén tus datos actualizados para que los entrenadores puedan adaptar tus rutinas.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FORMULARIO DEL ALUMNO */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md border-t-4 border-[#FFC72C]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-2">Peso Actual (kg)</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="Ej: 75.5"
                                        required
                                        className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                                        value={formData.peso_kg}
                                        onChange={e => setFormData({...formData, peso_kg: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-2">Estatura (cm)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Ej: 175"
                                        required
                                        className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                                        value={formData.estatura_cm}
                                        onChange={e => setFormData({...formData, estatura_cm: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Objetivo Principal</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Ganar masa muscular, Bajar de peso, Rendimiento..."
                                    required
                                    className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                                    value={formData.objetivo_principal}
                                    onChange={e => setFormData({...formData, objetivo_principal: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Lesiones Previas o Molestias</label>
                                <textarea 
                                    rows="3"
                                    placeholder="Detalla si tienes alguna lesión en rodillas, espalda, etc. Si no, escribe 'Ninguna'."
                                    required
                                    className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition resize-none"
                                    value={formData.lesiones_previas}
                                    onChange={e => setFormData({...formData, lesiones_previas: e.target.value})}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-[#003057] text-white font-black py-4 rounded-lg hover:bg-blue-900 transition shadow-md text-lg"
                            >
                                {isSaving ? 'Guardando...' : (fichaId ? 'Actualizar Ficha' : 'Crear Ficha')}
                            </button>
                        </form>
                    </div>

                    {/* PANEL DE OBSERVACIONES DEL ENTRENADOR */}
                    <div className="lg:col-span-1 h-fit">
                        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl shadow-sm">
                            <h3 className="font-black text-[#003057] text-xl mb-4 flex items-center gap-2">
                                🩺 Notas del Coach
                            </h3>
                            {observacionesEntrenador ? (
                                <p className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                                    {observacionesEntrenador}
                                </p>
                            ) : (
                                <p className="text-gray-400 italic text-sm">
                                    Tu entrenador aún no ha dejado observaciones en tu perfil.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}