import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

export default function ProtectedRoute({ allowedRoles }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const verificarPermisos = async () => {
            try {
                // Le preguntamos al backend quién es el usuario actual
                const res = await api.get('usuarios/me/');
                
                // Verificamos si su rol está dentro de los permitidos para esta ruta
                if (allowedRoles.includes(res.data.rol)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                // Si el token expiró o hay error, no lo dejamos pasar
                setIsAuthorized(false);
            }
        };

        verificarPermisos();
    }, [allowedRoles]);

    // Mientras le pregunta al servidor, mostramos una pantalla de carga
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#003057]"></div>
                <p className="mt-4 font-bold text-[#003057]">Verificando credenciales...</p>
            </div>
        );
    }

    // Si está autorizado, renderiza la ruta hija (<Outlet />). Si no, lo patea al Home.
    return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}