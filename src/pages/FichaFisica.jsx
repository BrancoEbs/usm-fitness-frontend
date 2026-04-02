import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function FichaFisica() {
    const [fichaId, setFichaId] = useState(null);
    const [formData, setFormData] = useState({
        peso_kg: '',
        estatura_cm: '',
        objetivo_principal: ''
    });
    const [observaciones, setObservaciones] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        cargarFicha();
    }, []);

    const cargarFicha = async () => {
        try {
            const resp = await api.get('fichas/');
            // Django nos devuelve una lista con las fichas del usuario
            if (resp.data.length > 0) {
                const miFicha = resp.data[0];
                setFichaId(miFicha.id);
                setFormData({
                    peso_kg: miFicha.peso_kg || '',
                    estatura_cm: miFicha.estatura_cm || '',
                    objetivo_principal: miFicha.objetivo_principal || ''
                });
                setObservaciones(miFicha.observaciones_entrenador || '');
            }
        } catch (error) {
            console.error("Error cargando ficha:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const guardarFicha = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (fichaId) {
                // Si ya existe, la actualizamos (PATCH)
                await api.patch(`fichas/${fichaId}/`, formData);
                alert('¡Ficha actualizada con éxito!');
            } else {
                // Si no existe, creamos una nueva (POST)
                const resp = await api.post('fichas/', formData);
                setFichaId(resp.data.id);
                alert('¡Ficha creada exitosamente!');
            }
        } catch (error) {
            alert('Error al guardar la ficha. Revisa los datos.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="container mx-auto p-6 max-w-2xl">
                <h2 className="text-3xl font-bold text-[#003057] mb-6">Mi Ficha Física</h2>

                {isLoading ? (
                    <div className="text-center text-xl text-gray-600 mt-10">Cargando datos...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-[#FFC72C]">
                        <form onSubmit={guardarFicha}>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Peso (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="peso_kg"
                                        value={formData.peso_kg}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003057] focus:outline-none"
                                        placeholder="Ej: 75.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Estatura (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="estatura_cm"
                                        value={formData.estatura_cm}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003057] focus:outline-none"
                                        placeholder="Ej: 175"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-bold mb-2">Objetivo Principal</label>
                                <input
                                    type="text"
                                    name="objetivo_principal"
                                    value={formData.objetivo_principal}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003057] focus:outline-none"
                                    placeholder="Ej: Ganar masa muscular, bajar de peso, etc."
                                    required
                                />
                            </div>

                            {/* Sección de solo lectura para las notas del entrenador */}
                            {observaciones && (
                                <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <h4 className="font-bold text-blue-800 mb-2">Observaciones de tu Entrenador:</h4>
                                    <p className="text-blue-900 italic">{observaciones}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-[#003057] hover:bg-blue-900 text-white font-bold py-3 px-4 rounded transition duration-200"
                            >
                                {isSaving ? 'Guardando...' : fichaId ? 'Actualizar Ficha' : 'Crear Ficha'}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}