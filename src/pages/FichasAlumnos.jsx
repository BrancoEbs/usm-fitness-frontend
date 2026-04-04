import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

// Reutilizamos el buscador inteligente
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
                <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#003057] rounded-lg shadow-2xl max-h-72 flex flex-col overflow-hidden">
                    <div className="p-2 bg-gray-50 border-b border-gray-200">
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

    // Cada vez que el entrenador elige un alumno, buscamos su ficha
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
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6 max-w-5xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[#003057]">Expedientes Físicos</h2>
                    <p className="text-gray-600 font-medium mt-1">Revisa las lesiones y objetivos de tus alumnos antes de armar sus rutinas.</p>
                </div>

                {/* BUSCADOR DE ALUMNOS */}
                <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-[#FFC72C] mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Buscar Alumno:</label>
                    <BuscadorInteligente 
                        placeholder="-- Selecciona un alumno de la lista --"
                        opciones={alumnos.map(al => ({ 
                            id: al.id, 
                            texto: `${al.first_name} ${al.last_name} (${al.username})` 
                        }))}
                        valor={alumnoSeleccionado}
                        alCambiar={setAlumnoSeleccionado}
                        className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none bg-white"
                    />
                </div>

                {/* ESTADOS DE LA FICHA */}
                {!alumnoSeleccionado && (
                    <div className="bg-transparent border-2 border-dashed border-gray-300 p-10 rounded-2xl text-center text-gray-400 font-bold">
                        Usa el buscador de arriba para ver el expediente de un alumno.
                    </div>
                )}

                {alumnoSeleccionado && errorFicha && (
                    <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center shadow-sm">
                        <span className="text-4xl block mb-2">⚠️</span>
                        <h3 className="text-xl font-bold text-red-800">{errorFicha}</h3>
                        <p className="text-red-600 mt-2">Dile al alumno que debe rellenar su ficha médica desde su perfil.</p>
                    </div>
                )}

                {/* FICHA DEL ALUMNO ENCONTRADA */}
                {alumnoSeleccionado && ficha && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-[#003057] p-4 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black">Ficha Fisica </h3>
                            <span className="bg-[#FFC72C] text-[#003057] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Confidencial</span>
                        </div>
                        
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Columna Izquierda: Datos del Alumno */}
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Peso</p>
                                        <p className="text-2xl font-black text-[#003057]">{ficha.peso_kg ? `${ficha.peso_kg} kg` : '--'}</p>
                                    </div>
                                    <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Estatura</p>
                                        <p className="text-2xl font-black text-[#003057]">{ficha.estatura_cm ? `${ficha.estatura_cm} cm` : '--'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase mb-2 border-b pb-1">Lesiones Previas o Dolencias</p>
                                    <p className="text-gray-800 font-medium bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {ficha.lesiones_previas || 'Ninguna reportada por el alumno.'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase mb-2 border-b pb-1">Objetivo Principal</p>
                                    <p className="text-gray-800 font-medium bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {ficha.objetivo_principal || 'No especificado.'}
                                    </p>
                                </div>
                            </div>

                            {/* Columna Derecha: Notas del Entrenador */}
                            <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 flex flex-col h-full">
                                <label className="text-sm font-black text-yellow-800 uppercase mb-2 flex items-center gap-2">
                                    <span></span> Notas del Coach
                                </label>
                                <p className="text-xs text-yellow-700 mb-4 font-medium">Estas notas son visibles para el alumno en su perfil.</p>
                                
                                <textarea 
                                    className="w-full flex-grow border-2 border-yellow-300 rounded-lg p-3 outline-none focus:border-yellow-500 bg-white font-medium resize-none min-h-[150px]"
                                    placeholder="Escribe aquí consideraciones especiales, progresos o cuidados para este alumno..."
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                />
                                
                                <button 
                                    onClick={guardarNota}
                                    disabled={guardando}
                                    className="w-full mt-4 bg-[#003057] text-white font-black py-3 rounded-lg hover:bg-blue-900 transition shadow-md"
                                >
                                    {guardando ? 'Guardando...' : 'Guardar Observaciones'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}