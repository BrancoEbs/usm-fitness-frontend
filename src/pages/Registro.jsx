import { useState } from 'react';
import api from '../api/axios'; // Volvemos a usar tu conexión oficial con Axios

export default function Registro() {
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        carrera: '',
        password: '',
        confirmarPassword: ''
    });

    const [cargando, setCargando] = useState(false);

    // --- FORMATEADOR AUTOMÁTICO DE RUT ---
    const handleRutChange = (e) => {
        // Quitamos todo lo que no sea número o la letra K
        const valorLimpio = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
        
        let rutFormateado = valorLimpio;
        // Si tiene más de 1 dígito, separamos el último carácter con un guion
        if (valorLimpio.length > 1) {
            const cuerpo = valorLimpio.slice(0, -1);
            const dv = valorLimpio.slice(-1);
            rutFormateado = `${cuerpo}-${dv}`;
        }
        
        setFormData({ ...formData, rut: rutFormateado });
    };

    // --- FUNCIÓN PARA PONER MAYÚSCULA INICIAL ---
    const capitalizar = (texto) => {
        return texto.trim().replace(/\b\w/g, letra => letra.toUpperCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Doble confirmación de contraseña
        if (formData.password !== formData.confirmarPassword) {
            alert('❌ Las contraseñas no coinciden. Por favor, revísalas.');
            return;
        }

        setCargando(true);

        // 2. Preparamos los datos inmaculados para el Backend
        const datosLimpios = {
            // Le quitamos el guion que le pusimos visualmente para que la BD lo guarde limpio
            username: formData.rut.trim(),
            first_name: capitalizar(formData.nombre),
            // Unimos los apellidos en el campo "last_name" que espera Django
            last_name: `${capitalizar(formData.apellidoPaterno)} ${capitalizar(formData.apellidoMaterno)}`,
            carrera: capitalizar(formData.carrera),
            password: formData.password
        };

        try {
            // 3. Apuntamos a la acción @registro que acabamos de crear en el ViewSet
            await api.post('usuarios/registro/', datosLimpios); 
            
            alert('¡Registro exitoso! Ya puedes iniciar sesión.');
            
            // Si quieres redirigir automáticamente al login, descomenta esta línea:
            // window.location.href = '/login';
            
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.username?.[0] || 'Error al registrar usuario. Verifica si el RUT ya existe.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-xl border-t-8 border-[#003057]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-[#003057]">Comunidad USM</h2>
                    <p className="text-gray-500 font-medium mt-2">Completa tus datos para acceder al gimnasio</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Campo: RUT */}
                    <div>
                        <label className="block font-bold mb-1 text-gray-700">RUT</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ej: 12345678-9"
                            value={formData.rut}
                            onChange={handleRutChange}
                            maxLength="10"
                            className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition font-medium"
                        />
                    </div>

                    {/* Campo: Nombres */}
                    <div>
                        <label className="block font-bold mb-1 text-gray-700">Nombres</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ej: Juan Andrés"
                            value={formData.nombre}
                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                        />
                    </div>

                    {/* Campos: Apellidos (Lado a Lado) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block font-bold mb-1 text-gray-700">Apellido Paterno</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="Ej: Pérez"
                                value={formData.apellidoPaterno}
                                onChange={e => setFormData({...formData, apellidoPaterno: e.target.value})}
                                className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-1 text-gray-700">Apellido Materno</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="Ej: González"
                                value={formData.apellidoMaterno}
                                onChange={e => setFormData({...formData, apellidoMaterno: e.target.value})}
                                className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                            />
                        </div>
                    </div>

                    {/* Campo: Carrera */}
                    <div>
                        <label className="block font-bold mb-1 text-gray-700">Carrera</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ej: Ingeniería en Informática"
                            value={formData.carrera}
                            onChange={e => setFormData({...formData, carrera: e.target.value})}
                            className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                        />
                    </div>

                    {/* Campos: Contraseñas (Lado a Lado) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                            <label className="block font-bold mb-1 text-gray-700">Contraseña</label>
                            <input 
                                type="password" 
                                required 
                                placeholder="Mínimo 8 caracteres"
                                minLength="8"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-[#003057] transition"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-1 text-gray-700">Confirmar Contraseña</label>
                            <input 
                                type="password" 
                                required 
                                placeholder="Repite tu contraseña"
                                minLength="8"
                                value={formData.confirmarPassword}
                                onChange={e => setFormData({...formData, confirmarPassword: e.target.value})}
                                className={`w-full border-2 p-3 rounded-lg outline-none transition ${
                                    formData.confirmarPassword && formData.password !== formData.confirmarPassword 
                                        ? 'border-red-400 bg-red-50' 
                                        : 'border-gray-200 focus:border-[#003057]'
                                }`}
                            />
                            {/* Alerta visual en vivo */}
                            {formData.confirmarPassword && formData.password !== formData.confirmarPassword && (
                                <p className="text-red-500 text-xs font-bold mt-1">Las contraseñas no coinciden</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={cargando}
                            className={`w-full font-black py-4 rounded-xl uppercase tracking-widest transition shadow-lg ${
                                cargando 
                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                    : 'bg-[#FFC72C] text-[#003057] hover:bg-yellow-500 hover:shadow-xl active:scale-95'
                            }`}
                        >
                            {cargando ? 'Creando cuenta...' : 'Registrarme'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}