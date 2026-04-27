import { useState, useEffect } from 'react';
import api from '../api/axios';

const BuscadorInteligente = ({ opciones, valor, alCambiar, placeholder, className }) => {
    const [busqueda, setBusqueda] = useState('');
    const [abierto, setAbierto] = useState(false);

    const opcionSeleccionada = opciones.find(opt => opt.id === valor);
    const opcionesFiltradas = opciones.filter(opt =>
        opt.texto.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="relative w-full">
            {abierto && <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)}></div>}
            <div className={`${className} cursor-pointer flex justify-between items-center relative z-20`} onClick={() => setAbierto(!abierto)}>
                <span className={`truncate ${opcionSeleccionada ? 'text-gray-800 font-bold' : 'text-gray-400 font-normal'}`}>
                    {opcionSeleccionada ? opcionSeleccionada.texto : placeholder}
                </span>
                <span className="text-gray-400 text-sm ml-2">{abierto ? '▲' : '▼'}</span>
            </div>
            {abierto && (
                <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#003057] rounded-xl shadow-2xl max-h-72 flex flex-col overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <input type="text" autoFocus className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#FFC72C] transition text-sm" placeholder="🔍 Escribe para buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                    <div className="overflow-y-auto">
                        <div className="p-3 text-sm text-red-500 font-bold hover:bg-red-50 cursor-pointer border-b border-gray-100" onClick={() => { alCambiar(''); setAbierto(false); setBusqueda(''); }}>✖ Quitar selección</div>
                        {opcionesFiltradas.length > 0 ? opcionesFiltradas.map(opt => (
                            <div key={opt.id} className="p-3 text-sm text-gray-700 hover:bg-[#003057] hover:text-white cursor-pointer transition border-b border-gray-50" onClick={() => { alCambiar(opt.id); setAbierto(false); setBusqueda(''); }}>{opt.texto}</div>
                        )) : <div className="p-4 text-sm text-gray-500 text-center italic">No se encontraron resultados</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function FichasAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
    
    const [ficha, setFicha] = useState(null);
    const [errorFicha, setErrorFicha] = useState('');
    const [nota, setNota] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        api.get('usuarios/')
            .then(res => setAlumnos(res.data.filter(u => u.rol === 1))) // Solo alumnos
            .catch(err => console.error("Error al cargar alumnos", err));
    }, []);

    useEffect(() => {
        if (!alumnoSeleccionado) {
            setFicha(null);
            setErrorFicha('');
            return;
        }

        api.get(`fichafisica/por_alumno/?alumno_id=${alumnoSeleccionado}`)
            .then(res => {
                setFicha(res.data);
                setNota(res.data.observaciones_entrenador || '');
                setErrorFicha('');
            })
            .catch(err => {
                setFicha(null);
                setErrorFicha(err.response?.data?.error || 'Error al cargar la ficha.');
            });
    }, [alumnoSeleccionado]);

    const guardarNota = async () => {
        setGuardando(true);
        try {
            await api.patch(`fichafisica/${ficha.id}/actualizar_nota/`, {
                observaciones_entrenador: nota
            });
            alert('¡Observaciones guardadas exitosamente!');
        } catch (error) {
            alert('Error al guardar las observaciones.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20 font-sans">
            
            {/* ENCABEZADO AZUL */}
            <div className="bg-[#003057] pt-20 pb-24 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">
                    <span className="text-[#FFC72C] text-xs font-black uppercase tracking-widest mb-2 block">Staff USM</span>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Expedientes Alumnos</h1>
                    <p className="text-blue-200 font-medium mt-2">Revisa lesiones y composición corporal antes de armar rutinas.</p>
                </div>
            </div>

            <main className="container mx-auto px-6 max-w-5xl -mt-12 relative z-20">
                
                {/* BUSCADOR DE ALUMNOS */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-4">
                    <label className="text-sm font-black text-[#003057] uppercase tracking-wide whitespace-nowrap">🔍 Seleccionar Alumno:</label>
                    <BuscadorInteligente 
                        placeholder="-- Busca por nombre o RUT --"
                        opciones={alumnos.map(al => ({ 
                            id: al.id, 
                            texto: `${al.first_name} ${al.last_name} (${al.username})` 
                        }))}
                        valor={alumnoSeleccionado}
                        alCambiar={setAlumnoSeleccionado}
                        className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none bg-gray-50 focus:bg-white transition"
                    />
                </div>

                {/* ESTADOS DE LA FICHA */}
                {!alumnoSeleccionado && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-3xl text-center text-gray-400 font-bold text-lg">
                        Selecciona un alumno en el buscador para abrir su expediente oficial.
                    </div>
                )}

                {alumnoSeleccionado && errorFicha && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-2xl shadow-sm text-center">
                        <span className="text-4xl block mb-2">⚠️</span>
                        <h3 className="text-xl font-black text-red-800">{errorFicha}</h3>
                        <p className="text-red-600 mt-2 font-medium">El alumno aún no ha completado el formulario inicial en su perfil.</p>
                    </div>
                )}

                {/* FICHA DEL ALUMNO ENCONTRADA */}
                {alumnoSeleccionado && ficha && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn">
                        
                        <div className="bg-[#003057] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div>
                                <h3 className="text-2xl font-black text-white">Expediente Médico</h3>
                                <p className="text-[#FFC72C] text-sm font-bold">{ficha.carrera_normalizada || 'Carrera no registrada'}</p>
                            </div>
                            <span className="bg-white text-[#003057] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Confidencial</span>
                        </div>
                        
                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50">
                            
                            {/* Columna Izquierda: Datos Físicos y Médicos */}
                            <div className="space-y-6">
                                {/* Composición */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <h4 className="text-sm font-black text-[#003057] uppercase mb-4 border-b pb-2">Composición Corporal</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase">Peso</p>
                                            <p className="text-xl font-black text-[#003057]">{ficha.peso_kg || '--'}<span className="text-xs font-normal">kg</span></p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase">Estatura</p>
                                            <p className="text-xl font-black text-[#003057]">{ficha.estatura_cm || '--'}<span className="text-xs font-normal">cm</span></p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase">% Grasa</p>
                                            <p className="text-lg font-black text-[#003057]">{ficha.porcentaje_grasa || '--'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase">% Músculo</p>
                                            <p className="text-lg font-black text-[#003057]">{ficha.masa_muscular || '--'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PAR-Q y Lesiones */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                    <h4 className="text-sm font-black text-[#003057] uppercase border-b pb-2">Salud y Objetivos</h4>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {ficha.condicion_cardiaca && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Cardíaco</span>}
                                        {ficha.dolor_pecho && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Dolor Pecho</span>}
                                        {ficha.mareos_desmayos && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Mareos</span>}
                                        {ficha.lesion_articular && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Lesión Articular</span>}
                                        {ficha.medicacion_presion && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Presión Alta</span>}
                                        
                                        {!ficha.condicion_cardiaca && !ficha.dolor_pecho && !ficha.mareos_desmayos && !ficha.lesion_articular && !ficha.medicacion_presion && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">PAR-Q Aprobado (Sin Riesgos)</span>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Lesiones Previas:</p>
                                        <p className="text-gray-800 text-sm font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {ficha.lesiones_previas || 'Ninguna reportada.'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Objetivo del Alumno:</p>
                                        <p className="text-gray-800 text-sm font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {ficha.objetivo_principal || 'No especificado.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Notas del Entrenador */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#FFC72C] flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#FFC72C]"></div>
                                <label className="text-sm font-black text-[#003057] uppercase mb-1 flex items-center gap-2">
                                    📋 Diagnóstico y Asignación
                                </label>
                                <p className="text-xs text-gray-500 mb-4 font-medium">Lo que escribas aquí será visible para el alumno en su perfil.</p>
                                
                                <textarea 
                                    className="w-full flex-grow border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-[#FFC72C] bg-gray-50 focus:bg-white font-medium resize-none min-h-[200px] text-sm text-gray-800 transition"
                                    placeholder="Escribe rutinas recomendadas, precauciones por lesiones o notas de progreso..."
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                />
                                
                                <button 
                                    onClick={guardarNota}
                                    disabled={guardando}
                                    className="w-full mt-4 bg-[#003057] text-[#FFC72C] text-sm font-black uppercase tracking-widest py-4 rounded-xl hover:bg-blue-900 transition shadow-md disabled:opacity-50"
                                >
                                    {guardando ? 'Guardando...' : 'Guardar Observaciones'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <style jsx="true">{`
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}