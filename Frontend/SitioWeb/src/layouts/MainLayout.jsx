import { useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Container, Navbar, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/MainLayout.css';
import logo from '../assets/logo.png';

const MENU = [
    
    { label: 'Inicio', icon: 'bi-house-door', to: '/', end: true },
    {
        label: 'Oferta Académica',
        icon: 'bi-building',
        children: [
            { label: 'Instituciones', to: '/instituciones' },
            { label: 'Carreras', to: '/carreras' },
            { label: 'Cursos', to: '/cursos' },
            { label: 'Grupos', to: '/grupos' },
            { label: 'Periodos', to: '/periodos' },
        ],
    },
    {
        label: 'Personas',
        icon: 'bi-people',
        children: [
            { label: 'Profesores', to: '/profesores' },
            { label: 'Expedientes', to: '/expedientes' },
        ],
    },
    {
        label: 'Matrícula',
        icon: 'bi-card-checklist',
        children: [
            { label: 'Pre-matrícula', to: '/prematricula' },
            { label: 'Matrícula', to: '/matricula' },
        ],
    },
    {
        label: 'Evaluación',
        icon: 'bi-journal-check',
        children: [
            { label: 'Notas', to: '/notas' },
            { label: 'Historial', to: '/historial' },
            { label: 'Listados', to: '/listados' },
        ],
    },
    {
        label: 'Finanzas',
        icon: 'bi-cash-coin',
        children: [
            { label: 'Facturas', to: '/facturas' },
            { label: 'Pagos', to: '/pagos' },
        ],
    },
    {
        label: 'Comunicación',
        icon: 'bi-bell',
        children: [{ label: 'Notificaciones', to: '/notificaciones' }],
    },
    {
        label: 'Sistema',
        icon: 'bi-gear',
        children: [
            { label: 'Usuarios', to: '/usuarios' },
            { label: 'Roles', to: '/roles' },
            { label: 'Módulos', to: '/modulos' },
            { label: 'Parámetros', to: '/parametros' },
            { label: 'Bitácoras', to: '/bitacoras' },
        ],
    },
];

const menuClass = (isActive) => `menu-item ${isActive ? 'is-active' : ''}`;

function SidebarLink({ item, collapsed }) {
    return (
        <NavLink
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => menuClass(isActive)}
        >
            <i className={`bi ${item.icon} menu-icon`} />
            {!collapsed && <span>{item.label}</span>}
        </NavLink>
    );
}

function SubmenuLink({ item }) {
    return (
        <NavLink
            to={item.to}
            className={({ isActive }) => `submenu-item ${isActive ? 'is-active' : ''}`}
        >
            {item.label}
        </NavLink>
    );
}

function SidebarSection({ item, collapsed, open, onToggle }) {
    const { pathname } = useLocation();
    const hasActiveChild = item.children.some((l) => pathname.startsWith(l.to));

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                title={collapsed ? item.label : undefined}
                className={menuClass(hasActiveChild)}
            >
                <i className={`bi ${item.icon} menu-icon`} />
                {!collapsed && (
                    <>
                        <span className="flex-grow-1 text-start">{item.label}</span>
                        <i className={`bi bi-chevron-right menu-chevron ${open ? 'rotated' : ''}`} />
                    </>
                )}
            </button>

            {!collapsed && open && (
                <div className="submenu">
                    {item.children.map((child) => (
                        <SubmenuLink key={child.to} item={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MainLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openSection, setOpenSection] = useState(null);
    const navigate = useNavigate();

    // Dato temporal (luego debe venir del contexto / login)
    const usuario = { nombre: 'Usuario Administrador', rol: 'Administrador' };
    const usuario2 = { nombre: 'Usuario Profesor', rol: 'Profesor' }

    const toggleSection = (label) => {
        setSidebarOpen(true); // si está colapsado, se expande para mostrar el submenú
        setOpenSection((prev) => (prev === label && sidebarOpen ? null : label));
    };

    const handleLogout = () => {
        // Más adelante deberá limpiar el token
        navigate('/login');
    };

    return (
        <div className="d-flex w-100" style={{ minHeight: '100vh' }}>

            {/* SIDEBAR */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logo} alt="Logo Meta U" className="sidebar-logo" />
                    {sidebarOpen && <span className="sidebar-title">Meta U</span>}
                </div>

                <nav className="sidebar-nav">
                    {MENU.map((item) =>
                        item.children ? (
                            <SidebarSection
                                key={item.label}
                                item={item}
                                collapsed={!sidebarOpen}
                                open={openSection === item.label}
                                onToggle={() => toggleSection(item.label)}
                            />
                        ) : (
                            <SidebarLink key={item.label} item={item} collapsed={!sidebarOpen} />
                        )
                    )}
                </nav>

                <div className="sidebar-footer">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
                    >
                        <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`} />
                    </Button>
                </div>
            </aside>

            {/* CONTENIDO */}
            <div className="content flex-grow-1 d-flex flex-column">

                {/* TOPBAR */}
                <Navbar bg="white" className="topbar border-bottom shadow-sm px-3">
                    <Container fluid className="justify-content-end gap-3">
                        <Button
                            variant="light"
                            className="rounded-circle border-0 p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 44, height: 44 }}
                            aria-label="Perfil de usuario"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-secondary"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                <path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
                            </svg>
                        </Button>
                        
                        <div className="d-flex flex-column lh-sm">
                            <span className="user-name fw-semibold text-dark">{usuario.nombre}</span>
                            <span className="user-role text-muted">{usuario.rol}</span>
                        </div>

                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="d-flex align-items-center gap-2"
                            onClick={handleLogout}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-logout">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                                <path d="M9 12h12l-3 -3" />
                                <path d="M18 15l3 -3" />
                            </svg>
                        </Button>
                    </Container>
                </Navbar>

                {/* ÁREA DE CONTENIDO */}
                <main className="p-4 bg-light flex-grow-1">
                    <Outlet />
                </main>

                {/* FOOTER */}
                <footer className="app-footer bg-white border-top text-muted small py-2 px-4 d-flex align-items-center justify-content-between">
                    <span>© {new Date().getFullYear()} Meta U</span>
                    <span className="d-none d-md-inline">v0.1.0</span>
                </footer>
            </div>
        </div>
    );
}