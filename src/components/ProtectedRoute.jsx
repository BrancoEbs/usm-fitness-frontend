// src/components/ProtectedRoute.jsx
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

export default function ProtectedRoute({ allowedRoles }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const verificarPermisos = async () => {
            try {
                const res = await api.get('usuarios/me/');
                const user = res.data;

                // IMPORTANTE: Verifica que allowedRoles incluya el rol del admin (usualmente 1)
                if (allowedRoles.includes(user.rol)) {
                    setIsAuthorized(true);
                } else {
                    console.error("Rol no autorizado para esta ruta");
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error("Error de autenticación", error);
                setIsAuthorized(false);
            }
        };

        verificarPermisos();
    }, [allowedRoles]);

    if (isAuthorized === null) {
        return <div>Cargando...</div>; // O tu spinner institucional
    }

    return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}