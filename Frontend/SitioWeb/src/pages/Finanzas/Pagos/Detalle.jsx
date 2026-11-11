import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import cursoService from '../../../services/cursoService'
import expedienteService from '../../../services/expedienteService'
import pagoService from '../../../services/pagoService'
import periodoService from '../../../services/periodoService'
import {
    badgeEstadoPago,
    formatearFecha,
    formatearMoneda,
    formatearNombrePeriodo,
    mensajeErrorPago,
    normalizarPago
} from '../../../utils/pagoUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function DetallePago() {
    const { pagoId } = useParams()
    const navigate = useNavigate()

    const [pago, setPago] = useState(null)
    const [nombrePeriodo, setNombrePeriodo] = useState('')
    const [nombreEstudiante, setNombreEstudiante] = useState('')
    const [mapaCursos, setMapaCursos] = useState({})
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    // Estado del modal de reversión
    const [mostrarModalReversar, setMostrarModalReversar] = useState(false)
    const [motivoReversion, setMotivoReversion] = useState('')
    const [errorMotivo, setErrorMotivo] = useState(null)
    const [reversando, setReversando] = useState(false)

    // Cargar nombres legibles de materias/cursos
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

    // Cargar el pago por ID
    useEffect(() => {
        let activo = true

        const cargarPago = async () => {
            setCargando(true)
            setErrorCarga(null)

            try {
                const { data } = await pagoService.getById(pagoId)
                if (!activo) return
                const normalizado = normalizarPago(data)
                setPago(normalizado)

                if (normalizado.factura?.periodoID) {
                    periodoService.getById(normalizado.factura.periodoID)
                        .then(({ data: perData }) => {
                            if (activo) setNombrePeriodo(formatearNombrePeriodo(perData))
                        })
                        .catch(() => {
                            if (activo) setNombrePeriodo(normalizado.factura.periodoID)
                        })
                }

                if (normalizado.identificacionEstudiante) {
                    expedienteService.getById(normalizado.identificacionEstudiante)
                        .then(({ data: expData }) => {
                            if (!activo || !expData) return
                            const nombre = expData.nombreCompleto || expData.NombreCompleto
                            if (nombre) setNombreEstudiante(nombre)
                        })
                        .catch(() => {})
                }
            } catch (error) {
                if (!activo) return
                setErrorCarga(mensajeErrorPago(error, 'No se pudo cargar el detalle del pago.'))
            } finally {
                if (activo) setCargando(false)
            }
        }

        if (pagoId) {
            cargarPago()
        }

        return () => { activo = false }
    }, [pagoId])

    const abrirModalReversar = () => {
        setMotivoReversion('')
        setErrorMotivo(null)
        setMostrarModalReversar(true)
    }

    const cerrarModalReversar = () => {
        if (reversando) return
        setMostrarModalReversar(false)
        setMotivoReversion('')
        setErrorMotivo(null)
    }

    const ejecutarReversion = async () => {
        const motivoLimpio = motivoReversion.trim()
        if (!motivoLimpio) {
            setErrorMotivo('El motivo de reversión es obligatorio.')
            return
        }
        if (motivoLimpio.length > 250) {
            setErrorMotivo('El motivo no puede exceder 250 caracteres.')
            return
        }

        setReversando(true)
        setErrorMotivo(null)

        try {
            await pagoService.reversar(pagoId, { motivo: motivoLimpio })
            const { data } = await pagoService.getById(pagoId)
            setPago(normalizarPago(data))
            setNotification({
                type: 'success',
                message: `El pago #${pagoId} fue reversado exitosamente. La factura asociada volvió a estar pendiente.`
            })
            cerrarModalReversar()
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorPago(error, 'No se pudo reversar el pago.')
            })
        } finally {
            setReversando(false)
        }
    }

    const obtenerNombreCurso = codigo => {
        if (!codigo) return '-'
        return mapaCursos[codigo.toUpperCase()] || codigo
    }

    const sePuedeReversar = pago && (
        pago.estado === 'Activo' ||
        pago.estado === 'ACT' ||
        pago.estado === 'Completado' ||
        pago.estado === 'Pagado'
    )

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title="Detalle de Pago" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={estiloBoton}
                        onClick={() => navigate('/pagos')}
                        title="Volver al listado"
                        aria-label="Volver al listado"
                    >
                        <i className="bi bi-arrow-left fs-5" />
                    </button>
                </div>

                {sePuedeReversar && (
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={abrirModalReversar}
                        className="d-flex align-items-center gap-1"
                    >
                        <i className="bi bi-arrow-counterclockwise" /> Reversar Pago
                    </Button>
                )}
            </div>

            {cargando ? (
                <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2">Cargando información del pago...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/pagos')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : pago ? (
                <>
                    {/* 1. Información General del Pago */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-light border-bottom py-3">
                            <span className="text-primary fw-semibold">
                                Información General del Pago
                            </span>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <Row className="g-3">
                                <Col md={3}>
                                    <div className="text-muted small">N° Pago</div>
                                    <div className="fw-semibold">#{pago.pagoID}</div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Estudiante</div>
                                    <div className="fw-semibold">
                                        {pago.identificacionEstudiante || '-'}
                                        {nombreEstudiante ? ` - ${nombreEstudiante}` : ''}
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Periodo</div>
                                    <div className="fw-semibold">{nombrePeriodo || '-'}</div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Estado</div>
                                    <div>
                                        <Badge
                                            bg={badgeEstadoPago(pago.estado)}
                                            text={pago.estado === 'Activo' ? 'dark' : undefined}
                                        >
                                            {pago.estado}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Fecha de Pago</div>
                                    <div className="fw-semibold">{formatearFecha(pago.fechaPago)}</div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">N° Factura Cancelada</div>
                                    <div className="fw-semibold">#{pago.facturaID}</div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Monto Pagado</div>
                                    <div className="fw-semibold">
                                        {formatearMoneda(pago.monto)}
                                    </div>
                                </Col>
                                {pago.estado === 'Reversado' && (
                                    <>
                                        <Col md={3}>
                                            <div className="text-muted small">Fecha de Reversión</div>
                                            <div className="fw-semibold text-danger">
                                                {formatearFecha(pago.fechaReversion)}
                                            </div>
                                        </Col>
                                        <Col md={12}>
                                            <div className="text-muted small">Motivo de Reversión</div>
                                            <div className="p-2 bg-light rounded border text-danger small">
                                                {pago.motivoReversion || 'Sin motivo registrado'}
                                            </div>
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* 2. Detalle de Factura (Servicios Estudiantiles) */}
                    {pago.factura && (
                        <>
                            <Card className="border-0 shadow-sm mb-3">
                                <Card.Header className="bg-light border-bottom py-3 d-flex justify-content-between align-items-center">
                                    <span className="text-primary fw-semibold">
                                        Detalle de Factura (Servicios Estudiantiles)
                                    </span>
                                    <span className="badge bg-secondary">
                                        {pago.factura.detalles?.length || 0} línea(s)
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
                                                {(!pago.factura.detalles || pago.factura.detalles.length === 0) ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center text-muted py-3">
                                                            No hay detalles registrados para esta factura
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pago.factura.detalles.map((d, index) => (
                                                        <tr key={d.detalleFacturaID || index}>
                                                            <td>{index + 1}</td>
                                                            <td className="fw-semibold">
                                                                {obtenerNombreCurso(d.cursoCode)}
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

                            {/* 3. Resumen financiero */}
                            <Card className="border-0 shadow-sm mb-3">
                                <Card.Body className="p-3">
                                    <Row className="justify-content-end">
                                        <Col md={4}>
                                            <div className="d-flex justify-content-between py-1">
                                                <span className="text-muted">Subtotal:</span>
                                                <span className="fw-semibold">
                                                    {formatearMoneda(pago.factura.subtotal)}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between py-1">
                                                <span className="text-muted">
                                                    Impuesto ({pago.factura.porcentajeImpuesto ?? 2}%):
                                                </span>
                                                <span className="fw-semibold">
                                                    {formatearMoneda(pago.factura.impuesto)}
                                                </span>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="d-flex justify-content-between py-1">
                                                <span className="h5 fw-bold text-dark mb-0">Total:</span>
                                                <span className="h5 fw-bold text-primary mb-0">
                                                    {formatearMoneda(pago.factura.total)}
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </>
                    )}

                    {/* 4. Comprobante Oficial de Pago (Se mantiene abajo) */}
                    <Card className="border border-secondary shadow-sm mb-4">
                        <Card.Header className="bg-dark text-white py-2 d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">
                                <i className="bi bi-receipt me-2" />
                                Comprobante de Pago — MetaU
                            </span>
                            <span className="small">N° {pago.pagoID}</span>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="border p-4 rounded bg-white">
                                <Row className="border-bottom pb-3 mb-3 align-items-center">
                                    <Col sm={6}>
                                        <h4 className="fw-bold mb-0 text-primary">MetaU</h4>
                                        <div className="text-muted small">Sistema de Gestión Académica y Financiera</div>
                                    </Col>
                                    <Col sm={6} className="text-sm-end mt-2 mt-sm-0">
                                        <div className="fw-semibold">COMPROBANTE DE CANCELACIÓN</div>
                                        <div className="text-muted small">Fecha: {formatearFecha(pago.fechaPago)}</div>
                                    </Col>
                                </Row>

                                <Row className="g-3 mb-3">
                                    <Col sm={6}>
                                        <div className="text-muted small">Identificación del Estudiante:</div>
                                        <div className="fw-bold">
                                            {pago.identificacionEstudiante || '-'}
                                            {nombreEstudiante ? ` - ${nombreEstudiante}` : ''}
                                        </div>
                                    </Col>
                                    <Col sm={6} className="text-sm-end">
                                        <div className="text-muted small">Periodo Académico:</div>
                                        <div className="fw-semibold">{nombrePeriodo || '-'}</div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="text-muted small">Factura Asociada:</div>
                                        <div>#{pago.facturaID}</div>
                                    </Col>
                                    <Col sm={6} className="text-sm-end">
                                        <div className="text-muted small">Estado:</div>
                                        <div>
                                            <Badge bg={badgeEstadoPago(pago.estado)}>
                                                {pago.estado.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </Col>
                                </Row>

                                {pago.factura?.detalles?.length > 0 && (
                                    <div className="table-responsive mb-3">
                                        <Table size="sm" className="mb-0 small align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Materia</th>
                                                    <th>Descripción</th>
                                                    <th className="text-end">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pago.factura.detalles.map((d, index) => (
                                                    <tr key={d.detalleFacturaID || index}>
                                                        <td>{index + 1}</td>
                                                        <td className="fw-semibold">
                                                            {obtenerNombreCurso(d.cursoCode)}
                                                        </td>
                                                        <td>{d.descripcion || 'Servicios estudiantiles'}</td>
                                                        <td className="text-end">{formatearMoneda(d.monto)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}

                                <div className="p-3 bg-light rounded border mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-semibold">Monto Total Cancelado:</span>
                                        <span className="fs-4 fw-bold text-primary">
                                            {formatearMoneda(pago.monto)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-muted small text-center mt-3">
                                    Este documento certifica el registro y cancelación del pago en los sistemas de MetaU.
                                    {pago.estado === 'Reversado' && (
                                        <div className="text-danger fw-semibold mt-1">
                                            *** ATENCIÓN: ESTE PAGO FUE REVERSADO EL {formatearFecha(pago.fechaReversion)} ***
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </>
            ) : null}

            {/* Modal de Reversión */}
            <Modal
                show={mostrarModalReversar}
                onHide={cerrarModalReversar}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="h5">Reversar Pago</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-2">
                        ¿Confirma que desea reversar el pago <strong>#{pago?.pagoID}</strong> por{' '}
                        <strong className="text-primary">{formatearMoneda(pago?.monto)}</strong>?
                    </p>
                    <p className="text-muted small mb-3">
                        <i className="bi bi-info-circle me-1" />
                        La factura #{pago?.facturaID} volverá al estado <strong>Pendiente de Cobro</strong>.
                    </p>

                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">
                            Motivo de la reversión <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Especifique el motivo de la reversión del pago..."
                            value={motivoReversion}
                            onChange={e => {
                                setMotivoReversion(e.target.value)
                                if (errorMotivo) setErrorMotivo(null)
                            }}
                            maxLength={250}
                            disabled={reversando}
                            isInvalid={!!errorMotivo}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMotivo}
                        </Form.Control.Feedback>
                        <div className="text-end text-muted small mt-1">
                            {motivoReversion.length}/250 caracteres
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={cerrarModalReversar}
                        disabled={reversando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={ejecutarReversion}
                        disabled={reversando}
                    >
                        {reversando ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Reversando...
                            </>
                        ) : (
                            'Confirmar Reversión'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default DetallePago
