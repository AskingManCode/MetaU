import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader'
import notificacionService from '../../../services/notificacionService'
import { mensajeError } from '../../../utils/sistemaUtils'
import {
    formatearFecha,
    normalizarNotificacion,
    obtenerBadgeEstado,
    sanitizarHTML
} from '../../../utils/notificacionUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function Campo({ etiqueta, children, valor }) {
    return (
        <Col md={6}>
            <div className="text-muted small mb-1">{etiqueta}</div>
            <div className="fw-semibold text-break">{children ?? (valor || '-')}</div>
        </Col>
    )
}

function Detalle() {
    const { notificacionId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const [notificacion, setNotificacion] = useState(
        location.state?.notificacion
            ? normalizarNotificacion(location.state.notificacion)
            : null
    )
    const [cargando, setCargando] = useState(!location.state?.notificacion)
    const [errorCarga, setErrorCarga] = useState(null)

    useEffect(() => {
        if (location.state?.notificacion) {
            return
        }

        let activo = true
        setCargando(true)
        setErrorCarga(null)

        notificacionService.getById(notificacionId)
            .then(({ data }) => {
                if (!activo) return
                setNotificacion(normalizarNotificacion(data))
            })
            .catch(error => {
                if (!activo) return
                setErrorCarga(mensajeError(error, 'No se pudo cargar la notificación solicitada.'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [notificacionId, location.state?.notificacion])

    const badge = notificacion ? obtenerBadgeEstado(notificacion.estadoNotificacion) : null
    const htmlSanitizado = notificacion ? sanitizarHTML(notificacion.cuerpo) : ''

    return (
        <div>
            <PageHeader title="Detalle de Notificación" />

            <div className="d-flex gap-2 mb-3">
                <button
                    type="button"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    onClick={() => navigate('/notificaciones')}
                    title="Volver al listado"
                    aria-label="Volver al listado"
                >
                    <i className="bi bi-arrow-left fs-5" />
                </button>
            </div>

            {cargando ? (
                <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2">Cargando información de la notificación...</p>
                </div>
            ) : errorCarga ? (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <div className="alert alert-danger mb-3">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/notificaciones')}>
                            <i className="bi bi-arrow-left me-2" />
                            Volver al listado
                        </Button>
                    </Card.Body>
                </Card>
            ) : notificacion ? (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-light border-bottom py-3 d-flex justify-content-between align-items-center">
                        <span className="text-primary fw-semibold">Información de la Notificación</span>
                        <span className="text-muted small">ID: #{notificacion.notificacionID}</span>
                    </Card.Header>

                    <Card.Body className="p-4">
                        <Row className="g-3 mb-4">
                            <Campo etiqueta="Destinatario(s)">
                                <span className="font-monospace text-primary">{notificacion.emailDestino}</span>
                            </Campo>

                            <Campo etiqueta="Estado de Envío">
                                {badge && (
                                    <Badge bg={badge.className.replace('badge bg-', '').replace(' text-dark', '')}>
                                        {badge.label}
                                    </Badge>
                                )}
                            </Campo>

                            <Campo etiqueta="Fecha de Creación" valor={formatearFecha(notificacion.fechaCreacion)} />
                            <Campo etiqueta="Fecha de Envío" valor={formatearFecha(notificacion.fechaEnvio)} />

                            <Col md={12}>
                                <div className="text-muted small mb-1">Asunto</div>
                                <div className="p-2 bg-light rounded border text-break fw-medium">
                                    {notificacion.asunto || '<Sin asunto>'}
                                </div>
                            </Col>

                            {notificacion.mensajeError && (
                                <Col md={12}>
                                    <div className="text-danger small fw-semibold mb-1">
                                        <i className="bi bi-exclamation-triangle-fill me-1" />
                                        Mensaje de Error
                                    </div>
                                    <div className="p-2 bg-danger-subtle text-danger rounded border border-danger-subtle small text-break">
                                        {notificacion.mensajeError}
                                    </div>
                                </Col>
                            )}
                        </Row>

                        <div className="border-top pt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small fw-semibold">
                                    <i className="bi bi-file-earmark-code me-1" />
                                    Cuerpo del Mensaje (HTML Renderizado)
                                </span>
                                <Badge bg="info-subtle" text="info" className="border border-info-subtle">
                                    HTML Seguro
                                </Badge>
                            </div>
                            <div
                                className="p-4 bg-white rounded border shadow-sm"
                                style={{ minHeight: '180px', maxHeight: '550px', overflowY: 'auto' }}
                                dangerouslySetInnerHTML={{
                                    __html: htmlSanitizado || '<em class="text-muted">Sin contenido en el cuerpo del mensaje.</em>'
                                }}
                            />
                        </div>
                    </Card.Body>
                </Card>
            ) : null}
        </div>
    )
}

export default Detalle
