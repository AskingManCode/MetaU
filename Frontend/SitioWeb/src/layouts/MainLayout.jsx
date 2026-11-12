import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/MainLayout.css';
import useAuth from '../hooks/useAuth';
import useSystemName from '../hooks/useSystemName';
import useUserProfile from '../hooks/useUserProfile';
import useDynamicMenu from '../hooks/useDynamicMenu';
import useLayoutAudit from '../hooks/useLayoutAudit';
import { getRouteInfo } from '../utils/navigationUtils';
import bitacoraService from '../services/bitacoraService';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Footer from '../components/layout/Footer';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import Notification from '../components/Notification';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openSection, setOpenSection] = useState(null);
    const [layoutNotification, setLayoutNotification] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const systemName = useSystemName();
    const { userName, userRole } = useUserProfile(user);
    const { menuItems, permissionsLoaded, permittedPaths } = useDynamicMenu(user?.role);

    const routeInfo = useMemo(() => getRouteInfo(location.pathname), [location.pathname]);

    useLayoutAudit({
        userEmail: user?.email,
        routeInfo,
        pathname: location.pathname,
    });

    useEffect(() => {
        document.title = `${routeInfo.title} | ${systemName}`;
    }, [routeInfo.title, systemName]);

    useEffect(() => {
        const currentPath = location.pathname;
        const matchingSection = menuItems.find(
            (sec) => sec.children && sec.children.some((c) => currentPath === c.to || currentPath.startsWith(c.to + '/'))
        );
        if (matchingSection) {
            setOpenSection(matchingSection.label);
        }
    }, [location.pathname, menuItems]);

    const isCurrentRoutePermitted = useMemo(() => {
        if (!permissionsLoaded) return true;

        const currentPath = location.pathname.replace(/\/+$/, '') || '/';
        if (currentPath === '/perfil') return true;
        if (currentPath === '/') return permittedPaths.has('/');

        for (const permitted of permittedPaths) {
            if (permitted !== '/' && (currentPath === permitted || currentPath.startsWith(permitted + '/'))) {
                return true;
            }
        }
        return false;
    }, [permissionsLoaded, location.pathname, permittedPaths]);

    useEffect(() => {
        if (!permissionsLoaded || isCurrentRoutePermitted) return;

        const isInitialRoot = location.pathname === '/' || location.pathname === '';
        if (!isInitialRoot && location.pathname !== '/perfil') {
            bitacoraService.create({
                descripcion: `Acceso no autorizado denegado: intento de acceso a ${location.pathname}`,
            }).catch(() => {});

            setLayoutNotification({
                type: 'warning',
                message: 'No cuenta con los permisos necesarios para acceder a este módulo.',
            });
        }

        let fallbackRoute = '/perfil';
        if (permittedPaths.has('/')) {
            fallbackRoute = '/';
        } else {
            for (const item of menuItems) {
                if (item.to && item.to !== '/') {
                    fallbackRoute = item.to;
                    break;
                }
                if (item.children?.[0]?.to) {
                    fallbackRoute = item.children[0].to;
                    break;
                }
            }
        }

        navigate(fallbackRoute, { replace: true });
    }, [permissionsLoaded, isCurrentRoutePermitted, location.pathname, menuItems, permittedPaths, navigate]);

    useEffect(() => {
        const handleNotificationEvent = (e) => {
            if (e.detail) setLayoutNotification(e.detail);
        };
        window.addEventListener('app:notification', handleNotificationEvent);
        return () => window.removeEventListener('app:notification', handleNotificationEvent);
    }, []);

    const toggleSection = (label) => {
        setSidebarOpen(true);
        setOpenSection((prev) => (prev === label && sidebarOpen ? null : label));
    };

    const handleNavigate = () => {
        if (window.innerWidth < 992) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('meta_u_bitacora_acceso');
        logout();
    };

    return (
        <div className="layout-wrapper">
            <Sidebar
                systemName={systemName}
                userRole={userRole}
                menuItems={menuItems}
                isOpen={sidebarOpen}
                openSection={openSection}
                onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
                onToggleSection={toggleSection}
                onNavigate={handleNavigate}
                onCloseBackdrop={() => setSidebarOpen(false)}
            />

            <div className="content flex-grow-1">
                <Topbar
                    systemName={systemName}
                    routeInfo={routeInfo}
                    userName={userName}
                    userRole={userRole}
                    onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                    onProfileClick={() => navigate('/perfil')}
                    onLogout={handleLogout}
                />

                <Notification
                    type={layoutNotification?.type || 'info'}
                    message={layoutNotification?.message}
                    show={!!layoutNotification}
                    onClose={() => setLayoutNotification(null)}
                    onConfirm={layoutNotification?.onConfirm}
                    onCancel={layoutNotification?.onCancel}
                />

                <main className="p-4 bg-light flex-grow-1">
                    <ErrorBoundary>
                        {permissionsLoaded && !isCurrentRoutePermitted ? (
                            <div className="d-flex flex-column justify-content-center align-items-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Verificando permisos...</span>
                                </div>
                                <span className="text-muted small">Redirigiendo a pantalla autorizada...</span>
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </ErrorBoundary>
                </main>

                <Footer systemName={systemName} />
            </div>
        </div>
    );
}
