import { useEffect, useMemo, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Notification from '../../components/Notification';
import useAuth from '../../hooks/useAuth';
import { loadDashboardData, recordDashboardView } from '../../services/dashboardService';
import notificacionService from '../../services/notificacionService';
import { formatearFecha, normalizarNotificacion } from '../../utils/notificacionUtils';

const roleName = (role) => role || 'Usuario autenticado';

const formatAudit = (audit) => audit?.descripcion
    ?? audit?.Descripcion
    ?? 'Actividad registrada';

function Dashboard() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');

    const isProfessor = String(user?.role ?? '').toLowerCase().includes('profesor');
    const quickLinks = useMemo(() => {
        if (isProfessor) {
            return [
                { href: '/grupos', icon: 'bi-people', label: 'Mis grupos' },
                { href: '/notas', icon: 'bi-journal-check', label: 'Carga de notas' },
                { href: '/perfil', icon: 'bi-person-circle', label: 'Mi perfil' },
            ];
        }

        return [
            { href: '/usuarios', icon: 'bi-person-badge', label: 'Usuarios' },
            { href: '/carreras', icon: 'bi-mortarboard', label: 'Carreras' },
            { href: '/cursos', icon: 'bi-book', label: 'Cursos' },
            { href: '/periodos', icon: 'bi-calendar3', label: 'Periodos' },
            { href: '/facturas', icon: 'bi-receipt', label: 'Facturación' },
        ];
    }, [isProfessor]);

    useEffect(() => {
        let active = true;

        recordDashboardView().catch(() => undefined);

        loadDashboardData(user?.role)
            .then((data) => {
                if (active) setDashboard(data);
            })
            .catch((loadError) => {
                if (active) {
                    setError(loadError.response?.data?.mensaje ?? 'No se pudo cargar la información del dashboard.');
                }
            });

        notificacionService.getAll()
            .then(({ data }) => {
                const lista = Array.isArray(data) ? data : data?.datos ?? data?.items ?? [];
                setNotifications(lista
                    .map(normalizarNotificacion)
                    .sort((first, second) => new Date(second.fechaCreacion ?? 0) - new Date(first.fechaCreacion ?? 0))
                    .slice(0, 5));
            })
            .catch(() => {
                if (active) setNotifications([]);
            });

        return () => {
            active = false;
        };
    }, [user?.role]);

    const metrics = dashboard?.metrics ?? {};

    return (
        <div>
            <PageHeader title="Bienvenida" />

            {error && (
                <Notification
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                />
            )}

            <section className="card border-0 shadow-sm mb-3">
                <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h1 className="h4 text-primary mb-1">
                        Bienvenido, {user?.email || 'usuario'}
                    </h1>
                    <p className="text-muted mb-0">Rol: {roleName(user?.role)}</p>
                </div>
                <div className="d-flex gap-2">
                    <Link className="btn btn-outline-primary" to="/perfil">
                        <i className="bi bi-person-circle me-2" />Perfil
                    </Link>
                    <Link className="btn btn-outline-secondary" to="/notificaciones">
                        <i className="bi bi-question-circle me-2" />Ayuda y soporte
                    </Link>
                </div>
                </div>
            </section>

            <section className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white text-primary fw-semibold">
                    Accesos rápidos
                </div>
                <div className="card-body">
                    <Row className="g-3">
                    {quickLinks.map((link) => (
                        <Col key={link.href} xs={12} sm={6} lg={isProfessor ? 4 : 3}>
                            <Link className="btn btn-outline-primary w-100 text-start" to={link.href}>
                                <i className={`bi ${link.icon} me-2`} />
                                {link.label}
                            </Link>
                        </Col>
                    ))}
                    </Row>
                </div>
            </section>

            <section className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white text-primary fw-semibold">Resumen</div>
                <div className="card-body">
                {dashboard ? (
                    <Row className="g-3">
                        {isProfessor ? (
                            <>
                                <Col xs={12} sm={6}>
                                    <div className="bg-light rounded p-3 h-100">
                                        <span className="text-muted d-block">Mis grupos</span>
                                        <span className="fs-3 fw-bold text-primary">{metrics.groups ?? 0}</span>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <div className="bg-light rounded p-3 h-100">
                                        <span className="text-muted d-block">Cursos del periodo</span>
                                        <span className="fs-3 fw-bold text-primary">{metrics.courses ?? 0}</span>
                                    </div>
                                </Col>
                            </>
                        ) : (
                            <>
                                {[
                                    ['Usuarios', metrics.users],
                                    ['Carreras', metrics.careers],
                                    ['Cursos', metrics.courses],
                                    ['Periodos activos', metrics.activePeriods],
                                    ['Facturas pendientes', metrics.pendingInvoices ?? 'No disponible'],
                                ].map(([label, metric]) => (
                                    <Col key={label} xs={12} sm={6} lg={4} xl={2}>
                                        <div className="bg-light rounded p-3 h-100">
                                            <span className="text-muted d-block">{label}</span>
                                            <span className="fs-3 fw-bold text-primary">{metric ?? 0}</span>
                                        </div>
                                    </Col>
                                ))}
                            </>
                        )}
                    </Row>
                ) : (
                    <p className="text-muted mb-0">Cargando métricas...</p>
                )}
                </div>
            </section>

            <Row className="g-3">
                <Col xs={12} lg={6}>
                    <section className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white text-primary fw-semibold">
                            Notificaciones recientes
                        </div>
                        <div className="card-body">
                        {notifications.length ? (
                            <ul className="list-group list-group-flush">
                                {notifications.map(notification => (
                                    <li className="list-group-item px-0" key={notification.notificacionID}>
                                        <div className="fw-semibold">{notification.asunto || 'Notificación del sistema'}</div>
                                        <div className="small text-muted">{notification.emailDestino} · {notification.estadoNotificacion}</div>
                                        <div className="small">{formatearFecha(notification.fechaCreacion)}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Alert variant="light" className="mb-0">No hay notificaciones recientes para mostrar.</Alert>
                        )}
                        </div>
                    </section>
                </Col>
                <Col xs={12} lg={6}>
                    <section className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white text-primary fw-semibold">
                            Últimas bitácoras relevantes
                        </div>
                        <div className="card-body">
                        {dashboard?.audits?.length ? (
                            <ul className="list-group list-group-flush">
                                {dashboard.audits.map((audit, index) => (
                                    <li className="list-group-item px-0" key={`${formatAudit(audit)}-${index}`}>
                                        {formatAudit(audit)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted mb-0">No hay bitácoras recientes para mostrar.</p>
                        )}
                        </div>
                    </section>
                </Col>
            </Row>
        </div>
    );
}

export default Dashboard;
