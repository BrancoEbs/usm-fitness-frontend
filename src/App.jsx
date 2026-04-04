import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importación de Páginas Públicas
import Login from './pages/Login';
import Registro from './pages/Registro';

// Importación de Páginas Privadas
import Home from './pages/Home';
import Planes from './pages/Planes';
import FichaFisica from './pages/FichaFisica';
import GestionBloques from './pages/GestionBloques';
import Asistencia from './pages/Asistencia';
import GestorRutinas from './pages/GestorRutinas';
import MisReservas from './pages/MisReservas';
import GestionUsuarios from './pages/GestionUsuarios';
import FichasAlumnos from './pages/FichasAlumnos';

// Importación del Guardia de Seguridad
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================== */}
        {/* RUTAS PÚBLICAS (No necesitan iniciar sesión) */}
        {/* ========================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* ========================================== */}
        {/* RUTAS PARA ALUMNOS (1), ENTRENADORES (2) Y ADMINS (3) */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={[1, 2, 3]} />}>
            <Route path="/" element={<Home />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/ficha" element={<FichaFisica />} />
            <Route path="/reservas" element={<MisReservas />} />
        </Route>

        {/* ========================================== */}
        {/* RUTAS SOLO PARA ENTRENADORES (2) Y ADMINS (3) */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={[2, 3]} />}>
            <Route path="/asistencia" element={<Asistencia />} />
            <Route path="/entrenador/rutinas" element={<GestorRutinas />} />
            <Route path="/fichas-alumnos" element={<FichasAlumnos />} />
        </Route>

        {/* ========================================== */}
        {/* RUTAS ESTRICTAS SOLO PARA ADMINS (3) */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={[3]} />}>
            <Route path="/admin/bloques" element={<GestionBloques />} />
            <Route path="/admin/usuarios" element={<GestionUsuarios />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;