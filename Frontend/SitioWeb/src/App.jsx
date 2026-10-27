import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Usuarios from "./pages/Sistema/Usuarios/Index";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<div><h2>Dashboard</h2><p>Contenido de Prueba</p></div>} />
          <Route path="usuarios" element={<Usuarios />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
