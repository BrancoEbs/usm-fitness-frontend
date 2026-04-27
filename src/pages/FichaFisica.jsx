import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function FichaFisica() {
    // 1. Agregamos todos los campos nuevos al estado inicial
    const [formData, setFormData] = useState({
        peso_kg: '',
        estatura_cm: '',
        porcentaje_grasa: '',
        masa_muscular: '',
        perimetro_cintura: '',
        condicion_cardiaca: false,
        dolor_pecho: false,
        mareos_desmayos: false,
        lesion_articular: false,
        medicacion_presion: false,
        recomendacion_medica: false,
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
            const res = await api.get('usuarios/me/');
            const ficha = res.data.ficha_fisica;

            if (ficha) {
                setFichaId(ficha.id);
                // 2. Mapeamos los datos de la base de datos al estado
                setFormData({
                    peso_kg: ficha.peso_kg || '',
                    estatura_cm: ficha.estatura_cm || '',
                    porcentaje_grasa: ficha.porcentaje_grasa || '',
                    masa_muscular: ficha.masa_muscular || '',
                    perimetro_cintura: ficha.perimetro_cintura || '',
                    condicion_cardiaca: ficha.condicion_cardiaca || false,
                    dolor_pecho: ficha.dolor_pecho || false,
                    mareos_desmayos: ficha.mareos_desmayos || false,
                    lesion_articular: ficha.lesion_articular || false,
                    medicacion_presion: ficha.medicacion_presion || false,
                    recomendacion_medica: ficha.recomendacion_medica || false,
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

    // 3. Función unificada para manejar cualquier cambio en inputs o checkboxes
    const handleCambio = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (fichaId) {
                await api.patch(`fichafisica/${fichaId}/`, formData);
                alert('¡Ficha actualizada con éxito!');
            } else {
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
        <div className="min-h-screen bg-gray-50 pb-12">
            <main className="container mx-auto p-6 max-w-5xl mt-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[#003057]">Mi Ficha Física</h2>
                    <p className="text-gray-600 mt-2 font-medium">Mantén tus datos actualizados para que los entrenadores puedan adaptar tus rutinas.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* FORMULARIO DEL ALUMNO */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md border-t-4 border-[#FFC72C]">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* SECCIÓN 1: Composición Corporal */}
                            <div>
                                <h3 className="text-xl font-bold text-[#003057] mb-4 border-b pb-2">1. Composición Corporal</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 mb-1">Peso (kg)</label>
                                        <input type="number" step="0.1" name="peso_kg" required className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition" value={formData.peso_kg} onChange={handleCambio} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 mb-1">Estatura (cm)</label>
                                        <input type="number" name="estatura_cm" required className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition" value={formData.estatura_cm} onChange={handleCambio} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 mb-1">Cintura (cm)</label>
                                        <input type="number" step="0.1" name="perimetro_cintura" className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition" value={formData.perimetro_cintura} onChange={handleCambio} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 mb-1">% Grasa</label>
                                        <input type="number" step="0.1" name="porcentaje_grasa" className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition" value={formData.porcentaje_grasa} onChange={handleCambio} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 mb-1">% Músculo</label>
                                        <input type="number" step="0.1" name="masa_muscular" className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition" value={formData.masa_muscular} onChange={handleCambio} />
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: PAR-Q Médico */}
                            <div>
                                <h3 className="text-xl font-bold text-[#003057] mb-4 border-b pb-2">2. Cuestionario de Salud (PAR-Q+)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { label: 'Condición Cardíaca diagnosticada', name: 'condicion_cardiaca' },
                                        { label: 'Dolor de Pecho al ejercitar', name: 'dolor_pecho' },
                                        { label: 'Mareos o Pérdida de conocimiento', name: 'mareos_desmayos' },
                                        { label: 'Lesión Ósea o Articular', name: 'lesion_articular' },
                                        { label: 'Medicación para Presión/Corazón', name: 'medicacion_presion' },
                                        { label: 'Restricción Médica Activa', name: 'recomendacion_medica' }
                                    ].map((pregunta) => (
                                        <label key={pregunta.name} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData[pregunta.name] ? 'bg-red-50 border-red-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input 
                                                type="checkbox" 
                                                name={pregunta.name} 
                                                checked={formData[pregunta.name]} 
                                                onChange={handleCambio} 
                                                className="w-5 h-5 text-[#003057] rounded border-gray-300 focus:ring-[#FFC72C]" 
                                            />
                                            <span className={`ml-3 text-sm font-bold ${formData[pregunta.name] ? 'text-red-700' : 'text-gray-700'}`}>{pregunta.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* SECCIÓN 3: Detalles y Objetivos */}
                            <div>
                                <h3 className="text-xl font-bold text-[#003057] mb-4 border-b pb-2">3. Metas y Observaciones</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 mb-1">Objetivo Principal</label>
                                        <input type="text" name="objetivo_principal" required placeholder="Ej: Ganar masa muscular, Rendimiento..." className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition" value={formData.objetivo_principal} onChange={handleCambio} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 mb-1">Detalle de Lesiones Previas</label>
                                        <textarea rows="3" name="lesiones_previas" required placeholder="Detalla si tienes alguna lesión específica. Si no, escribe 'Ninguna'." className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition resize-none" value={formData.lesiones_previas} onChange={handleCambio} ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* BOTÓN DE GUARDADO */}
                            <button type="submit" disabled={isSaving} className="w-full bg-[#003057] text-[#FFC72C] font-black py-4 rounded-lg hover:bg-blue-900 transition shadow-md text-lg disabled:opacity-50">
                                {isSaving ? 'Guardando Datos...' : (fichaId ? 'Actualizar Mi Ficha' : 'Crear Ficha')}
                            </button>

                        </form>
                    </div>

                    {/* PANEL DE OBSERVACIONES DEL ENTRENADOR */}
                    <div className="lg:col-span-1 h-fit sticky top-24">
                        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl shadow-sm">
                            <h3 className="font-black text-[#003057] text-xl mb-4 flex items-center gap-2">
                                 📋 Notas del Coach
                            </h3>
                            {observacionesEntrenador ? (
                                <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-blue-100 shadow-inner">
                                    {observacionesEntrenador}
                                </p>
                            ) : (
                                <p className="text-gray-500 italic text-sm text-center bg-white p-4 rounded-lg border border-blue-100">
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