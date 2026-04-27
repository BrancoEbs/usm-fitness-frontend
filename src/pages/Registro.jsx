import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// =====================================================================
// BUSCADOR INTELIGENTE
// =====================================================================
const BuscadorInteligente = ({ opciones, valor, alCambiar, placeholder }) => {
    const [busqueda, setBusqueda] = useState('');
    const [abierto, setAbierto] = useState(false);

    const opcionSeleccionada = opciones.find(opt => opt.texto === valor);
    const opcionesFiltradas = opciones.filter(opt =>
        opt.texto.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="relative w-full">
            {abierto && <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)}></div>}
            <div className={`w-full border border-gray-300 p-3 rounded-lg outline-none bg-gray-50 cursor-pointer flex justify-between items-center relative z-20`} onClick={() => setAbierto(!abierto)}>
                <span className={`truncate ${opcionSeleccionada ? 'text-gray-900 font-medium' : 'text-gray-500 font-normal'}`}>
                    {opcionSeleccionada ? opcionSeleccionada.texto : placeholder}
                </span>
                <span className="text-gray-400 text-sm ml-2">{abierto ? '▲' : '▼'}</span>
            </div>
            {abierto && (
                <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#003057] rounded-lg shadow-2xl max-h-60 flex flex-col overflow-hidden">
                    <div className="p-2 bg-gray-50 border-b border-gray-200">
                        <input type="text" autoFocus className="w-full p-2 border border-gray-300 rounded outline-none focus:border-[#FFC72C] transition text-sm" placeholder="🔍 Buscar carrera..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                    <div className="overflow-y-auto">
                        {opcionesFiltradas.length > 0 ? opcionesFiltradas.map((opt, idx) => (
                            <div key={idx} className="p-3 text-sm text-gray-700 hover:bg-[#003057] hover:text-white cursor-pointer border-b border-gray-50" onClick={() => { alCambiar(opt.texto); setAbierto(false); setBusqueda(''); }}>{opt.texto}</div>
                        )) : <div className="p-4 text-sm text-gray-500 text-center italic">Carrera no encontrada</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

const CARRERAS_USM = [
    { texto: 'Arquitectura (Casa Central)' },
    { texto: 'Construcción Civil (Casa Central)' },
    { texto: 'Licenciatura en Astrofísica (Casa Central)' },
    { texto: 'Licenciatura en Física (Casa Central)' },
    { texto: 'Química (Casa Central)' },
    { texto: 'Ingeniería Civil (Casa Central)' },
    { texto: 'Ingeniería Civil Ambiental (Casa Central)' },
    { texto: 'Ingeniería Civil de Minas (Casa Central)' },
    { texto: 'Ingeniería Civil Electrónica (Casa Central)' },
    { texto: 'Ingeniería Civil Eléctrica (Casa Central)' },
    { texto: 'Ingeniería Civil Física (Casa Central)' },
    { texto: 'Ingeniería Civil Industrial (Casa Central)' },
    { texto: 'Ingeniería Civil Informática (Casa Central)' },
    { texto: 'Ingeniería Civil Matemática (Casa Central)' },
    { texto: 'Ingeniería Civil Mecánica (Casa Central)' },
    { texto: 'Ingeniería Civil Metalúrgica (Casa Central)' },
    { texto: 'Ingeniería Civil Química (Casa Central)' },
    { texto: 'Ingeniería Civil Telemática (Casa Central)' },
    { texto: 'Ingeniería Comercial (Casa Central)' },
    { texto: 'Ingeniería en Diseño de Productos (Casa Central)' },
    { texto: 'Ingeniería en Fabricación y Diseño Industrial (Sede Viña del Mar)' },
    { texto: 'Ingeniería en Informática (Sede Viña del Mar)' },
    { texto: 'Ingeniería en Mantenimiento Industrial (Sede Viña del Mar)' },
    { texto: 'Ingeniería en Prevención de Riesgos Laborales y Ambientales (Sede Viña del Mar)' },
    { texto: 'Ingeniería Civil Industrial Vespertino (Sede Viña del Mar)' },
    { texto: 'Ingeniería Comercial Vespertino (Sede Viña del Mar)' },
    { texto: 'Ingeniería de Ejecución en Control e Instrumentación Industrial Vespertino (Sede Viña del Mar)' },
    { texto: 'Ingeniería de Ejecución en Gestión y Control Ambiental Vespertino (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario Dibujante Proyectista (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Administración de Empresas (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Alimentos (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Biotecnología (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Ciencia de Datos (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Construcción (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Control del Medio Ambiente (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Electricidad (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Energías Renovables (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Informática (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Mantenimiento Industrial (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Mecánica Automotriz (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Mecánica Industrial (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Minería y Metalurgia (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Proyectos de Ingeniería (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Química Analítica (Sede Viña del Mar)' },
    { texto: 'Técnico Universitario en Telecomunicaciones y Redes (Sede Viña del Mar)' },
    { texto: 'Programa de Magíster o Doctorado (Casa Central)' },
    { texto: 'Profesor / Funcionario USM' },
    { texto: 'Otra Carrera / Programa' }
];

export default function Registro() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    // Estado para el Freno de Mano del formulario
    const [aceptaDeclaracion, setAceptaDeclaracion] = useState(false);

    const [formData, setFormData] = useState({
        rut: '', first_name: '', last_name: '', email: '', password: '', carrera: '',
        estatura_cm: '', peso_kg: '', porcentaje_grasa: '', masa_muscular: '', perimetro_cintura: '',
        condicion_cardiaca: false, dolor_pecho: false, mareos_desmayos: false, lesion_articular: false,
        medicacion_presion: false, recomendacion_medica: false, observaciones_adicionales: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'rut') {
            let rutLimpio = value.replace(/[^0-9kK]/g, '').toUpperCase();
            let rutFormateado = rutLimpio;
            if (rutLimpio.length > 1) {
                rutFormateado = `${rutLimpio.slice(0, -1)}-${rutLimpio.slice(-1)}`;
            }
            setFormData({ ...formData, rut: rutFormateado });
            return;
        }
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const avanzarPaso = () => {
        setError('');
        if (paso === 1) {
            if (!formData.rut || !formData.first_name || !formData.email || !formData.password || !formData.carrera) {
                return setError('Por favor completa todos los campos personales.');
            }
            if (!formData.email.endsWith('@sansano.usm.cl') && !formData.email.endsWith('@usm.cl')) {
                return setError('Debes usar tu correo institucional (@sansano.usm.cl o @usm.cl)');
            }
        }
        if (paso === 2) {
            if (!formData.estatura_cm || !formData.peso_kg) {
                return setError('El peso y la estatura son obligatorios.');
            }
        }
        setPaso(paso + 1);
    };

    const retrocederPaso = () => {
        setError('');
        setPaso(paso - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verificación de seguridad extra por si acaso
        if (paso !== 3) return;
        
        setError('');
        setCargando(true);

        try {
            const payloadUsuario = {
                username: formData.rut,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                rol: 1
            };
            
            await api.post('usuarios/registro/', payloadUsuario);
            
            const resLogin = await api.post('token/', {
                username: formData.rut,
                password: formData.password
            });
            localStorage.setItem('access_token', resLogin.data.access);
            
            await api.post('fichafisica/', {
                peso_kg: formData.peso_kg,
                estatura_cm: formData.estatura_cm,
                carrera_normalizada: formData.carrera,
                porcentaje_grasa: formData.porcentaje_grasa,
                masa_muscular: formData.masa_muscular,
                perimetro_cintura: formData.perimetro_cintura,
                lesiones_previas: formData.lesion_articular ? 'Reportó molestias articulares' : 'Ninguna',
                objetivo_principal: `PAR-Q: Cardíaco(${formData.condicion_cardiaca}), Mareos(${formData.mareos_desmayos}), Meds(${formData.medicacion_presion}). Notas: ${formData.observaciones_adicionales}`
            });

            alert('¡Registro y Ficha completados con éxito!');
            navigate('/');
            
        } catch (err) {
            console.error("🚨 DETALLE DEL ERROR:", err.response?.data);
            if (err.response?.data) {
                const mensajeBackend = JSON.stringify(err.response.data);
                setError(`Error del servidor: ${mensajeBackend}`);
            } else {
                setError('Error al registrar. Verifica si el RUT o el correo ya existen.');
            }
        } finally {
            setCargando(false);
        }
    };

    // Controlador seguro del formulario
    const handleFormAction = (e) => {
        e.preventDefault(); // Siempre prevenimos el comportamiento por defecto de HTML
        if (paso === 3) {
            handleSubmit(e);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#003057] p-4 font-sans relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FFC72C] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-[#003057] tracking-tight">Registro <span className="text-[#FFC72C]">Gimnasio USM</span></h2>
                        <p className="text-gray-500 mt-2 font-medium">Completa tu perfil en 3 sencillos pasos</p>
                    </div>

                    <div className="flex justify-between items-center mb-8 relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#FFC72C] transition-all duration-500 z-0" style={{ width: `${((paso - 1) / 2) * 100}%` }}></div>
                        
                        {[1, 2, 3].map(num => (
                            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative z-10 transition-colors duration-300 ${paso >= num ? 'bg-[#FFC72C] text-[#003057]' : 'bg-gray-200 text-gray-500'}`}>
                                {num}
                            </div>
                        ))}
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded shadow-sm animate-pulse">{error}</div>}

                    {/* El formulario ahora está controlado de forma segura */}
                    <form onSubmit={handleFormAction}>
                        
                        {paso === 1 && (
                            <div className="space-y-5 animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">1. Datos Personales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">RUT (Sin puntos, con guion)</label>
                                        <input type="text" name="rut" placeholder="Ej: 12345678-9" value={formData.rut} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Correo Institucional</label>
                                        <input type="email" name="email" placeholder="nombre.apellido@sansano.usm.cl" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombres</label>
                                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Apellidos</label>
                                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] bg-gray-50" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Carrera</label>
                                    <BuscadorInteligente 
                                        opciones={CARRERAS_USM} 
                                        valor={formData.carrera} 
                                        alCambiar={(val) => setFormData({...formData, carrera: val})} 
                                        placeholder="Busca tu carrera..." 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña Segura</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] bg-gray-50" />
                                </div>
                            </div>
                        )}

                        {paso === 2 && (
                            <div className="space-y-5 animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">2. Composición Corporal</h3>
                                <p className="text-sm text-gray-500 mb-4">Ingresa tus datos físicos actuales. Si no conoces algún % exacto, puedes dejarlo en blanco.</p>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Estatura (cm) *</label>
                                        <input type="number" name="estatura_cm" placeholder="Ej: 175" value={formData.estatura_cm} onChange={handleChange} className="w-full border p-3 rounded-lg bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Peso (kg) *</label>
                                        <input type="number" name="peso_kg" placeholder="Ej: 70.5" step="0.1" value={formData.peso_kg} onChange={handleChange} className="w-full border p-3 rounded-lg bg-gray-50" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">% Masa Muscular</label>
                                        <input type="number" name="masa_muscular" placeholder="Ej: 40" value={formData.masa_muscular} onChange={handleChange} className="w-full border p-3 rounded-lg bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">% Grasa Corporal</label>
                                        <input type="number" name="porcentaje_grasa" placeholder="Ej: 15" value={formData.porcentaje_grasa} onChange={handleChange} className="w-full border p-3 rounded-lg bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Perímetro Cintura (cm)</label>
                                        <input type="number" name="perimetro_cintura" placeholder="Ej: 80" value={formData.perimetro_cintura} onChange={handleChange} className="w-full border p-3 rounded-lg bg-gray-50" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paso === 3 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">3. Cuestionario de Salud (PAR-Q)</h3>
                                <p className="text-sm text-gray-500 mb-2">Marca las casillas si tu respuesta es <strong>SÍ</strong> a alguna de estas condiciones:</p>
                                
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    {[
                                        { id: 'condicion_cardiaca', label: '¿Algún médico le ha dicho alguna vez que tiene una condición cardíaca?' },
                                        { id: 'dolor_pecho', label: '¿Siente dolor en el pecho cuando realiza actividad física?' },
                                        { id: 'mareos_desmayos', label: '¿Pierde el equilibrio debido a mareos o alguna vez ha perdido el conocimiento?' },
                                        { id: 'lesion_articular', label: '¿Tiene algún problema óseo o articular que podría empeorar con la actividad física?' },
                                        { id: 'medicacion_presion', label: '¿Le receta su médico actualmente medicamentos para la presión arterial o el corazón?' },
                                        { id: 'recomendacion_medica', label: '¿Sabe de alguna otra razón por la cual no debería participar en actividad física?' }
                                    ].map((pregunta) => (
                                        <label key={pregunta.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded transition">
                                            <input type="checkbox" name={pregunta.id} checked={formData[pregunta.id]} onChange={handleChange} className="mt-1 w-5 h-5 text-[#003057] rounded border-gray-300 focus:ring-[#FFC72C]" />
                                            <span className="text-sm text-gray-700 font-medium leading-tight">{pregunta.label}</span>
                                        </label>
                                    ))}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones adicionales o lesiones específicas</label>
                                    <textarea name="observaciones_adicionales" rows="2" placeholder="Ej: Operación de rodilla en 2023..." value={formData.observaciones_adicionales} onChange={handleChange} className="w-full border p-3 rounded-lg bg-gray-50 resize-none"></textarea>
                                </div>

                                {/* EL FRENO DE MANO: Checkbox Obligatorio */}
                                <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            required 
                                            checked={aceptaDeclaracion}
                                            onChange={(e) => setAceptaDeclaracion(e.target.checked)}
                                            className="w-5 h-5 text-[#003057] rounded border-gray-300 focus:ring-[#FFC72C]" 
                                        />
                                        <span className="ml-3 text-sm font-bold text-[#003057]">
                                            Declaro que he leído el cuestionario y mi información es verídica. *
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* BOTONERA INFERIOR */}
                        <div className="mt-8 flex justify-between gap-4">
                            {paso > 1 ? (
                                <button type="button" onClick={retrocederPaso} className="w-1/3 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition">
                                    Volver
                                </button>
                            ) : (
                                <div className="w-1/3"></div>
                            )}
                            
                            {paso < 3 ? (
                                <button type="button" onClick={avanzarPaso} className="flex-1 bg-[#003057] text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition shadow-lg">
                                    Siguiente Paso
                                </button>
                            ) : (
                                <button type="submit" disabled={cargando || !aceptaDeclaracion} className="flex-1 bg-[#FFC72C] text-[#003057] font-black py-3 rounded-lg hover:bg-yellow-500 transition shadow-lg disabled:opacity-50">
                                    {cargando ? 'Procesando...' : 'Finalizar Registro'}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-gray-500 text-sm">¿Ya tienes cuenta? </span>
                        <Link to="/login" className="text-[#003057] font-bold text-sm hover:underline">Inicia sesión aquí</Link>
                    </div>
                </div>
            </div>
            
            <style jsx="true">{`
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}