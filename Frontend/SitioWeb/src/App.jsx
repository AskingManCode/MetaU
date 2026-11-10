import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login/Index.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Perfil from "./pages/MiPerfil/Index.jsx";
import Dashboard from "./pages/Dashboard/Index.jsx";
import Usuarios from "./pages/Sistema/Usuarios/Index.jsx";
import Instituciones from "./pages/OfertaAcademica/instituciones/Index.jsx";
import CrearInstitucion from "./pages/OfertaAcademica/instituciones/Create.jsx";
import EditarInstitucion from "./pages/OfertaAcademica/instituciones/Edit.jsx";
import CrearUsuario from "./pages/Sistema/Usuarios/Create.jsx";
import EditarUsuario from "./pages/Sistema/Usuarios/Edit.jsx";
import DetalleUsuario from "./pages/Sistema/Usuarios/Detalle.jsx";
import Carreras from "./pages/OfertaAcademica/Carreras/Index.jsx";
import Cursos from "./pages/OfertaAcademica/cursos/Index.jsx";
import CrearCurso from "./pages/OfertaAcademica/cursos/Create.jsx";
import EditarCurso from "./pages/OfertaAcademica/cursos/Edit.jsx";
import Grupos from "./pages/OfertaAcademica/Grupos/Index.jsx";
import Periodos from "./pages/OfertaAcademica/Periodos/Index.jsx";
import Profesores from "./pages/Personas/Profesores/Index.jsx";
import Expedientes from "./pages/Personas/Expedientes/Index.jsx";
import Prematricula from "./pages/Matricula/Prematricula/Index.jsx";
import Matricula from "./pages/Matricula/Matricula/Index.jsx";
import Notas from "./pages/Evaluacion/Notas/Index.jsx";
import Listados from "./pages/Evaluacion/Listados/Index.jsx";
import Historial from "./pages/Evaluacion/Historial/Index.jsx";
import Facturas from "./pages/Finanzas/Facturas/Index.jsx";
import Pagos from "./pages/Finanzas/Pagos/Index.jsx";
import Notificaciones from "./pages/Comunicacion/Notificaciones/Index.jsx";
import Roles from "./pages/Sistema/Roles/Index.jsx";
import CrearRol from "./pages/Sistema/Roles/Create.jsx";
import EditarRol from "./pages/Sistema/Roles/Edit.jsx";
import PermisosRol from "./pages/Sistema/Roles/Permisos.jsx";
import Modulos from "./pages/Sistema/Modulos/Index.jsx";
import CrearModulo from "./pages/Sistema/Modulos/Create.jsx";
import EditarModulo from "./pages/Sistema/Modulos/Edit.jsx";
import Parametros from "./pages/Sistema/Parametros/Index.jsx";
import Bitacoras from "./pages/Sistema/Bitacoras/Index.jsx";

function App() {

    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

                    {/** Mi Perfil */}
                    <Route path="perfil" element={<Perfil />} />

                    {/** Dashboard */}
                    <Route index element={<Dashboard />} />
                    
                    {/** Oferta Académica */}
                    <Route path="instituciones" element={<Instituciones />} />
                    <Route path="instituciones/nuevo" element={<CrearInstitucion />} />
                    <Route path="instituciones/editar/:institucionId" element={<EditarInstitucion />} />
                    <Route path="carreras" element={<Carreras />} />
                    <Route path="cursos" element={<Cursos />} />
                    <Route path="cursos/nuevo" element={<CrearCurso />} />
                    <Route path="cursos/editar/:cursoCode" element={<EditarCurso />} />
                    <Route path="grupos" element={<Grupos />} />
                    <Route path="periodos" element={<Periodos />} />

                    {/* Personas */}
                    <Route path="profesores" element={<Profesores />} />
                    <Route path="expedientes" element={<Expedientes />} />

                    {/* Matrícula */}
                    <Route path="prematricula" element={<Prematricula />} />
                    <Route path="matricula" element={<Matricula />} />

                    {/* Evaluación */}
                    <Route path="notas" element={<Notas />} />
                    <Route path="listados" element={<Listados />} />
                    <Route path="historial" element={<Historial />} />

                    {/* Finanzas */}
                    <Route path="facturas" element={<Facturas />} />
                    <Route path="pagos" element={<Pagos />} />

                    {/* Comunicación */}
                    <Route path="notificaciones" element={<Notificaciones />} />

                    {/* Sistema */}
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="usuarios/nuevo" element={<CrearUsuario />} />
                    <Route path="usuarios/editar/:email" element={<EditarUsuario />} />
                    <Route path="usuarios/ver/:email" element={<DetalleUsuario />} />
                    <Route path="roles" element={<Roles />} />
                    <Route path="roles/nuevo" element={<CrearRol />} />
                    <Route path="roles/editar/:rolId" element={<EditarRol />} />
                    <Route path="roles/permisos/:rolId" element={<PermisosRol />} />
                    <Route path="modulos" element={<Modulos />} />
                    <Route path="modulos/nuevo" element={<CrearModulo />} />
                    <Route path="modulos/editar/:moduloId" element={<EditarModulo />} />
                    <Route path="parametros" element={<Parametros />} />
                    <Route path="bitacoras" element={<Bitacoras />} />

                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App
