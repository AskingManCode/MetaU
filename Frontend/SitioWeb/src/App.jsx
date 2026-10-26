import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<div><h2>Dashboard</h2><p>Contenido de Prueba</p></div>} />
          <Route path="usuarios" element={<div><h2>Usuarios</h2><p>Aquí irá el listado</p></div>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
