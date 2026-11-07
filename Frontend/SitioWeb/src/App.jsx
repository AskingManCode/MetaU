import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
//import Login from "./pages/Login/Index.jsx";
import Perfil from "./pages/MiPerfil/Index.jsx";
import Dashboard from "./pages/Dashboard/Index.jsx";
import Usuarios from "./pages/Sistema/Usuarios/Index.jsx";
import Instituciones from "./pages/OfertaAcademica/Instituciones/Index.jsx";
import Carreras from "./pages/OfertaAcademica/Carreras/Index.jsx";
import Cursos from "./pages/OfertaAcademica/Cursos/Index.jsx";
import Grupos from './pages/OfertaAcademica/grupos/Index.jsx'
import CrearGrupo from './pages/OfertaAcademica/grupos/Create.jsx'
import EditarGrupo from './pages/OfertaAcademica/grupos/Edit.jsx'
import Periodos from './pages/OfertaAcademica/periodos/Index.jsx';
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
import Modulos from "./pages/Sistema/Modulos/Index.jsx";
import Parametros from "./pages/Sistema/Parametros/Index.jsx";
import Bitacoras from "./pages/Sistema/Bitacoras/Index.jsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                {/** Login */}
                {/**<Route path="/login" element={<Login />} /> */}

                <Route path="/" element={<MainLayout />}>

                    {/** Mi Perfil */}
                    <Route path="perfil" element={<Perfil />} />

                    {/** Dashboard */}
                    <Route index element={<Dashboard />} />
                    
                    {/** Oferta Académica */}
                    <Route path="instituciones" element={<Instituciones />} />
                    <Route path="carreras" element={<Carreras />} />
                    <Route path="cursos" element={<Cursos />} />
                    <Route path="grupos" element={<Grupos />} />
                    <Route path="grupos/nuevo" element={<CrearGrupo />} />
                    <Route path="grupos/editar/:grupoCode" element={<EditarGrupo />} />     
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
                    <Route path="roles" element={<Roles />} />
                    <Route path="modulos" element={<Modulos />} />
                    <Route path="parametros" element={<Parametros />} />
                    <Route path="bitacoras" element={<Bitacoras />} />

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
