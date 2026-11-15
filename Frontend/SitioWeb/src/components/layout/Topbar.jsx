import { Link } from 'react-router-dom';
import { Navbar, Container, Button } from 'react-bootstrap';
import logo from '../../assets/logo.png';

export default function Topbar({
    systemName,
    routeInfo,
    userName,
    userRole,
    onToggleSidebar,
    onProfileClick,
    onLogout,
}) {
    return (
        <Navbar bg="white" className="topbar border-bottom shadow-sm px-3 sticky-top">
            <Container fluid className="d-flex align-items-center justify-content-between p-0">
                <div className="d-flex align-items-center gap-2 gap-md-3 min-w-0">
                    <Button
                        variant="light"
                        className="d-lg-none p-1 d-flex align-items-center justify-content-center border"
                        style={{ width: 38, height: 38 }}
                        onClick={onToggleSidebar}
                        aria-label="Alternar menú lateral"
                        title="Menú"
                    >
                        <i className="bi bi-list fs-4 text-dark" />
                    </Button>

                    <div className="d-lg-none d-flex align-items-center gap-2 me-2 flex-shrink-0">
                        <img src={logo} alt={`Logo ${systemName}`} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                        <span className="fw-bold text-primary small d-none d-sm-inline">{systemName}</span>
                    </div>

                    <div className="d-flex align-items-center text-truncate">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0 py-0 small text-muted">
                                {routeInfo.breadcrumbs.map((crumb, idx) => {
                                    const isLast = idx === routeInfo.breadcrumbs.length - 1;
                                    return (
                                        <li
                                            key={crumb.label + idx}
                                            className={`breadcrumb-item ${isLast ? 'active fw-medium text-dark' : ''}`}
                                            aria-current={isLast ? 'page' : undefined}
                                        >
                                            {crumb.to && !isLast ? (
                                                <Link to={crumb.to}>{crumb.label}</Link>
                                            ) : (
                                                crumb.label
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2 gap-sm-3 flex-shrink-0">
                    <Button
                        variant="light"
                        className="rounded-circle border-0 p-0 d-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40 }}
                        aria-label="Perfil de usuario"
                        title="Mi Perfil"
                        onClick={onProfileClick}
                    >
                        <i className="bi bi-person-circle fs-3 text-secondary" />
                    </Button>

                    <div className="d-none d-md-flex flex-column lh-sm text-end">
                        <span className="user-name fw-semibold text-dark text-truncate" style={{ maxWidth: 180 }} title={userName}>
                            {userName}
                        </span>
                        <span className="user-role badge bg-primary-subtle text-primary border border-primary-subtle align-self-end mt-1 px-2 py-0">
                            {userRole}
                        </span>
                    </div>

                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="btn-logout rounded"
                        title="Cerrar sesión"
                        aria-label="Cerrar sesión"
                        onClick={onLogout}
                    >
                        <i className="bi bi-box-arrow-right fs-6" />
                    </Button>
                </div>
            </Container>
        </Navbar>
    );
}
