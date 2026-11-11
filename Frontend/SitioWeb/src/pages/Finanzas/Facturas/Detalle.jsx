import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import cursoService from '../../../services/cursoService'
import facturaService from '../../../services/facturaService'
import periodoService from '../../../services/periodoService'
import {
    badgeEstadoFactura,
    formatearFecha,
    formatearMoneda,
    formatearNombrePeriodo,
    mensajeErrorFactura,
    normalizarFactura
} from '../../../utils/facturaUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function DetalleFactura() {
    const { facturaId } = useParams()
    const navigate = useNavigate()

    const [factura, setFactura] = useState(null)
    const [nombrePeriodo, setNombrePeriodo] = useState('')
    const [mapaCursos, setMapaCursos] = useState({})
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    // Estado del modal de anulación
    const [mostrarModalAnular, setMostrarModalAnular] = useState(false)
    const [motivoAnulacion, setMotivoAnulacion] = useState('')
    const [errorMotivo, setErrorMotivo] = useState(null)
    const [anulando, setAnulando] = useState(false)

    // Cargar nombres de cursos para mostrar nombres legibles en vez de códigos internos
    useEffect(() => {
        let activo = true

        cursoService.getAll()
            .then(({ data }) => {
                if (!activo) return
                const lista = Array.isArray(data) ? data : data?.datos ?? []
                const mapa = {}
                for (const c of lista) {
                    const code = c.cursoCode || c.CursoCode
                    const nombre = c.nombre || c.Nombre
                    if (code) {
                        mapa[code.toUpperCase()] = nombre || code
                    }
                }
                setMapaCursos(mapa)
            })
            .catch(() => {})

        return () => { activo = false }
    }, [])

    // Cargar nombre del periodo para no mostrar el GUID
    useEffect(() => {
        let activo = true
        if (!factura?.periodoID) return

        periodoService.getById(factura.periodoID)
            .then(({ data }) => {
                if (!activo) return
                setNombrePeriodo(formatearNombrePeriodo(data))
            })
            .catch(() => {
                if (!activo) return
                setNombrePeriodo(factura.periodoID)
            })

        return () => { activo = false }
    }, [factura?.periodoID])

    useEffect(() => {
        let activo = true

        const cargarFactura = async () => {
            setCargando(true)
            setErrorCarga(null)

            try {
                const { data } = await facturaService.getById(facturaId)
                if (!activo) return
                setFactura(normalizarFactura(data))
            } catch (error) {
                if (!activo) return
                setErrorCarga(mensajeErrorFactura(error, 'No se pudo cargar la factura.'))
            } finally {
                if (activo) setCargando(false)
            }
        }

        if (facturaId) {
            cargarFactura()
        }

        return () => { activo = false }
    }, [facturaId])

    const abrirModalAnular = () => {
        setMotivoAnulacion('')
        setErrorMotivo(null)
        setMostrarModalAnular(true)
    }

    const cerrarModalAnular = () => {
        if (anulando) return
        setMostrarModalAnular(false)
        setMotivoAnulacion('')
        setErrorMotivo(null)
    }

    const ejecutarAnulacion = async () => {
        const motivoLimpio = motivoAnulacion.trim()
        if (!motivoLimpio) {
            setErrorMotivo('El motivo de anulación es obligatorio.')
            return
        }
        if (motivoLimpio.length > 250) {
            setErrorMotivo('El motivo no puede exceder 250 caracteres.')
            return
        }

        setAnulando(true)
        setErrorMotivo(null)

        try {
            await facturaService.anular(facturaId, motivoLimpio)

            setFactura(prev => prev ? {
                ...prev,
                estado: 'Anulada',
                fechaAnulacion: new Date().toISOString(),
                motivoAnulacion: motivoLimpio
            } : null)

            setNotification({
                type: 'success',
                message: `La factura #${facturaId} ha sido anulada exitosamente.`
            })
            cerrarModalAnular()
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorFactura(error, 'No se pudo anular la factura.')
            })
        } finally {
            setAnulando(false)
        }
    }

    const sePuedeAnular = factura && factura.estado === 'Pendiente de Cobro'

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title="Detalle de Factura" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={estiloBoton}
                        onClick={() => navigate('/facturas')}
                        title="Volver al listado"
                        aria-label="Volver al listado"
                    >
                        <i className="bi bi-arrow-left fs-5" />
                    </button>
                </div>

                {sePuedeAnular && (
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={abrirModalAnular}
                        className="d-flex align-items-center gap-1"
                    >
                        <i className="bi bi-x-circle" />
                        Anular Factura
                    </Button>
                )}
            </div>

            {cargando ? (
                <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2">Cargando información de la factura...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/facturas')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : factura ? (
                <>
                    {/* Encabezado de la factura */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-light border-bottom py-3">
                            <span className="text-primary fw-semibold">
                                Información General de la Factura
                            </span>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <Row className="g-3">
                                <Col md={3}>
                                    <div className="text-muted small">N° Factura</div>
                                    <div className="fw-semibold">#{factura.facturaID}</div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Estudiante</div>
                                    <div className="fw-semibold">{factura.identificacionEstudiante || '-'}</div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Periodo</div>
                                    <div className="fw-semibold">{nombrePeriodo || factura.periodoID || '-'}</div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Estado</div>
                                    <div>
                                        <Badge
                                            bg={badgeEstadoFactura(factura.estado)}
                                            text={factura.estado === 'Pendiente de Cobro' ? 'dark' : undefined}
                                        >
                                            {factura.estado}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Fecha de Emisión</div>
                                    <div className="fw-semibold">{formatearFecha(factura.fechaEmision)}</div>
                                </Col>
                                {factura.estado === 'Anulada' && (
                                    <>
                                        <Col md={3}>
                                            <div className="text-muted small">Fecha de Anulación</div>
                                            <div className="fw-semibold text-danger">
                                                {formatearFecha(factura.fechaAnulacion)}
                                            </div>
                                        </Col>
                                        <Col md={12}>
                                            <div className="text-muted small">Motivo de Anulación</div>
                                            <div className="p-2 bg-light rounded border small">
                                                {factura.motivoAnulacion || 'Sin motivo registrado'}
                                            </div>
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Detalle de líneas de cobro */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-light border-bottom py-3 d-flex justify-content-between align-items-center">
                            <span className="text-primary fw-semibold">
                                Detalle de Factura (Servicios Estudiantiles)
                            </span>
                            <span className="badge bg-secondary">
                                {factura.detalles.length} línea(s)
                            </span>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '60px' }}>#</th>
                                            <th>Materia</th>
                                            <th>Descripción</th>
                                            <th className="text-end">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {factura.detalles.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted py-3">
                                                    No hay detalles registrados para esta factura
                                                </td>
                                            </tr>
                                        ) : (
                                            factura.detalles.map((d, index) => (
                                                <tr key={d.detalleFacturaID || index}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-semibold">
                                                        {mapaCursos[d.cursoCode?.toUpperCase()] || d.cursoCode || '-'}
                                                    </td>
                                                    <td>{d.descripcion || 'Servicios estudiantiles'}</td>
                                                    <td className="text-end">{formatearMoneda(d.monto)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Resumen financiero */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Body className="p-3">
                            <Row className="justify-content-end">
                                <Col md={4}>
                                    <div className="d-flex justify-content-between py-1">
                                        <span className="text-muted">Subtotal:</span>
                                        <span className="fw-semibold">{formatearMoneda(factura.subtotal)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between py-1">
                                        <span className="text-muted">
                                            Impuesto ({factura.porcentajeImpuesto ?? 2}%):
                                        </span>
                                        <span className="fw-semibold">{formatearMoneda(factura.impuesto)}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between py-1">
                                        <span className="h5 fw-bold text-dark mb-0">Total:</span>
                                        <span className="h5 fw-bold text-primary mb-0">
                                            {formatearMoneda(factura.total)}
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </>
            ) : null}

            {/* Modal de Anulación */}
            <Modal
                show={mostrarModalAnular}
                onHide={cerrarModalAnular}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="h5">Anular Factura</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-3">
                        ¿Realmente desea anular la factura <strong>#{factura?.facturaID}</strong> correspondiente al estudiante <strong>{factura?.identificacionEstudiante}</strong>? Esta acción no se puede revertir.
                    </p>
                    <Form.Group controlId="motivoAnulacionDetalle">
                        <Form.Label className="small fw-semibold">
                            Motivo de la anulación <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Indique el motivo por el cual se anula la factura..."
                            value={motivoAnulacion}
                            onChange={e => {
                                setMotivoAnulacion(e.target.value)
                                if (errorMotivo) setErrorMotivo(null)
                            }}
                            maxLength={250}
                            disabled={anulando}
                            isInvalid={!!errorMotivo}
                        />
                        <div className="d-flex justify-content-between mt-1">
                            <span className="text-danger small">{errorMotivo}</span>
                            <span className="text-muted small ms-auto">
                                {motivoAnulacion.length}/250 caracteres
                            </span>
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={cerrarModalAnular}
                        disabled={anulando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={ejecutarAnulacion}
                        disabled={anulando || !motivoAnulacion.trim()}
                    >
                        {anulando ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Anulando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-x-circle me-1" />
                                Confirmar Anulación
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default DetalleFactura
