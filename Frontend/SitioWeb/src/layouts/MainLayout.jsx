import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/logo.jpg';

export default function MainLayout(){
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Datos temporales (luego deben venir del contexto / login)
    const usuario = { nombre: 'Usuario Administrador', rol: 'Administrador' };

    const handleLogout = () => {
        // Esto más adelante limpiará el token
        navigate('/login');
    }

    return(

        <div className="d-flex w-100" style={{ minHeight: '100vh' }}>

            {/** SIDEBAR */}
            <div className="text-white d-flex flex-column" 
                style={{
                    width: sidebarOpen ? '250px' : '83px',
                    transition: 'width 0.25s ease',
                    flexShrink: 0,
                    backgroundColor: '#1e3a8a',
                }}>
                
                {/** Logo + Título */}
                <div className="p-3 border-bottom border-white border-opacity-25 d-flex align-items-center gap-2" >
                    <img 
                        src={logo} 
                        alt="Logo Meta U" 
                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                        className="bg-white rounded-circle p-1"
                    />
                    {sidebarOpen && <span className="fw-bold fs-3">Meta U</span>}
                </div>

                {/** Menú */}
                <Nav className="flex-column flex-grow-1 p-2">
                    <Nav.Link href='/inicio' className="text-white">
                        {sidebarOpen ? 'Inicio' : 'I'} 
                    </Nav.Link>
                    <Nav.Link href='/usuarios' className='text-white'>
                        {sidebarOpen ? 'Usuarios' : 'U'}
                    </Nav.Link>
                    {/** Más ítems que se irán agregando */}
                </Nav>
                
                {/** Botón para abrir/cerrar sidebar */}
                <div className="border-top border-white border-opacity-25 d-flex justify-content-center align-items-center" style={{ minHeight: '62px' }}>

                    <Button variant="light" size="sm" className="rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 42, height: 42 }} onClick={ () => setSidebarOpen(!sidebarOpen) }>
                        { sidebarOpen ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        )}
                    </Button>

                </div>

            </div>
            
            {/** CONTENIDO */}
            <div className="flex-grow-1 d-flex flex-column">
                
                {/** TOPBAR */}
                <Navbar bg="white" className='border-bottom shadow-sm px-3' style={{ minHeight: '82px' }}>
                    <Container fluid>
                        <Navbar.Brand className="me-auto"></Navbar.Brand>
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-secondary small">
                                {usuario.nombre} ({usuario.rol})
                            </span>
                            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                                Salir
                            </Button>
                        </div>
                    </Container>
                </Navbar>

                {/** ÁREA DE CONTENIDO */}
                <main className='p-4 bg-light flex-grow-1'>
                    <Outlet /> {/** Aquí se renderizan las páginas */}
                </main>

            </div>

        </div>
    );
}