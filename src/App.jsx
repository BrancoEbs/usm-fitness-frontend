import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import MisReservas from './pages/MisReservas';
import FichaFisica from './pages/FichaFisica';
import Asistencia from './pages/Asistencia';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionBloques from './pages/GestionBloques';
import Planes from './pages/Planes';
import GestorRutinas from './pages/GestorRutinas';
import Registro from './pages/Registro';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/reservas" element={<ProtectedRoute><MisReservas /></ProtectedRoute>} />
        <Route path="/ficha" element={<ProtectedRoute><FichaFisica /></ProtectedRoute>} />
        <Route path="/asistencia" element={<ProtectedRoute><Asistencia /></ProtectedRoute>} />

        {/* <-- 2. Añade la ruta del Panel de Control de Usuarios --> */}
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute>
              <GestionUsuarios />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/bloques" element={<ProtectedRoute><GestionBloques /></ProtectedRoute>} />
        <Route path="/planes" element={<ProtectedRoute><Planes /></ProtectedRoute>} />
        <Route path="/entrenador/rutinas" element={<ProtectedRoute><GestorRutinas /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;