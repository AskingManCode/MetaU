import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import { obtenerEstado } from '../../../hooks/usePeriodos'
import cursoService from '../../../services/cursoService'
import expedienteService from '../../../services/expedienteService'
import facturaService from '../../../services/facturaService'
import listaEstudiantesService from '../../../services/listaEstudiantesService'
import matriculaService from '../../../services/matriculaService'
import pagoService from '../../../services/pagoService'
import periodoService from '../../../services/periodoService'
import {
    formatearFecha,
    formatearMoneda,
    formatearNombrePeriodo,
    mensajeErrorPago,
    normalizarTexto
} from '../../../utils/pagoUtils'
import { normalizarFactura } from '../../../utils/facturaUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function CreatePago() {
    const navigate = useNavigate()

    const [periodos, setPeriodos] = useState([])
    const [periodoID, setPeriodoID] = useState('')
    const [estudiantes, setEstudiantes] = useState([])
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('')
    const [facturasPendientes, setFacturasPendientes] = useState([])
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null)
    const [mapaCursos, setMapaCursos] = useState({})
    const [mapaEstudiantes, setMapaEstudiantes] = useState({})
    const [mapaGrupos, setMapaGrupos] = useState({})
    const [filtroEstudiante, setFiltroEstudiante] = useState('')

    const [cargandoPeriodos, setCargandoPeriodos] = useState(true)
    const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false)
    const [cargandoFacturas, setCargandoFacturas] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    // Cargar periodos al inicio
    useEffect(() => {
        let activo = true

        periodoService.getAll()
            .then(({ data }) => {
                if (!activo) return
                const lista = Array.isArray(data) ? data : data?.datos ?? []
                setPeriodos(lista)

                if (lista.length > 0) {
                    const activoPeriodo = lista.find(p => obtenerEstado(p) === 'Activo')
                    const inicial = activoPeriodo ? activoPeriodo.periodoID : lista[0].periodoID
                    setPeriodoID(inicial)
                }
            })
            .catch(error => {
                if (!activo) return
                setNotification({
                    type: 'error',
                    message: mensajeErrorPago(error, 'No se pudieron cargar los periodos.')
                })
            })
            .finally(() => {
                if (activo) setCargandoPeriodos(false)
            })

        return () => { activo = false }
    }, [])

    // Cargar catálogo de materias/cursos para nombres legibles
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

    // Cargar estudiantes matriculados en el periodo
    useEffect(() => {
        let activo = true
        if (!periodoID) {
            setEstudiantes([])
            setMapaEstudiantes({})
            return
        }

        setCargandoEstudiantes(true)
        listaEstudiantesService.getByPeriodo(periodoID)
            .then(({ data }) => {
                if (!activo) return
                const lista = Array.isArray(data) ? data : []
                const unicos = []
                const mapa = {}
                const setIds = new Set()
                for (const item of lista) {
                    const id = item.identificacion || item.Identificacion
                    const nombre = item.nombreCompleto || item.NombreCompleto || id
                    if (id) {
                        mapa[id] = nombre
                        if (!setIds.has(id)) {
                            setIds.add(id)
                            unicos.push({ identificacion: id, nombreCompleto: nombre })
                        }
                    }
                }
                setEstudiantes(unicos)
                setMapaEstudiantes(mapa)
            })
            .catch(() => {
                if (activo) {
                    setEstudiantes([])
                    setMapaEstudiantes({})
                }
            })
            .finally(() => {
                if (activo) setCargandoEstudiantes(false)
            })

        return () => { activo = false }
    }, [periodoID])

    // Cargar facturas del periodo seleccionado
    useEffect(() => {
        let activo = true
        setFacturaSeleccionada(null)

        if (!periodoID) {
            setFacturasPendientes([])
            return
        }

        setCargandoFacturas(true)

        facturaService.getByPeriodo(periodoID)
            .then(({ data }) => {
                if (!activo) return
                const lista = Array.isArray(data) ? data.map(normalizarFactura) : []
                const pendientes = lista.filter(f =>
                    f.estado === 'Pendiente de Cobro' ||
                    f.estado === 'PEND' ||
                    f.estado === 'Pendiente'
                )
                setFacturasPendientes(pendientes)
            })
            .catch(error => {
                if (!activo) return
                setFacturasPendientes([])
                setNotification({
                    type: 'error',
                    message: mensajeErrorPago(error, 'No se pudieron cargar las facturas del periodo.')
                })
            })
            .finally(() => {
                if (activo) setCargandoFacturas(false)
            })

        return () => { activo = false }
    }, [periodoID])

    // Fallback: si la factura seleccionada tiene un estudiante que no estaba en el listado, buscarlo en expediente
    useEffect(() => {
        let activo = true
        const id = facturaSeleccionada?.identificacionEstudiante
        if (!id || mapaEstudiantes[id]) return

        expedienteService.getById(id)
            .then(({ data }) => {
                if (!activo || !data) return
                const nombre = data.nombreCompleto || data.NombreCompleto
                if (nombre) {
                    setMapaEstudiantes(prev => ({ ...prev, [id]: nombre }))
                }
            })
            .catch(() => {})

        return () => { activo = false }
    }, [facturaSeleccionada, mapaEstudiantes])

    // Cargar grupos matriculados del estudiante para mostrar en el detalle de cobro
    useEffect(() => {
        let activo = true
        const idEstudiante = facturaSeleccionada?.identificacionEstudiante
        if (!idEstudiante) {
            setMapaGrupos({})
            return
        }

        matriculaService.getAll({ identificacion: idEstudiante })
            .then(({ data }) => {
                if (!activo) return
                const lista = Array.isArray(data) ? data : []
                const mapa = {}
                for (const m of lista) {
                    const cCode = (m.cursoCode ?? m.CursoCode ?? '').toUpperCase()
                    const gCode = m.grupoCode ?? m.GrupoCode
                    const perMat = m.periodoID ?? m.PeriodoID ?? m.periodoId
                    const coincidePeriodo = !periodoID || !perMat || String(perMat).toLowerCase() === String(periodoID).toLowerCase()
                    if (cCode && gCode && coincidePeriodo) {
                        mapa[cCode] = gCode
                    }
                }
                setMapaGrupos(mapa)
            })
            .catch(() => {
                if (activo) setMapaGrupos({})
            })

        return () => { activo = false }
    }, [facturaSeleccionada, periodoID])

    const cambiarPeriodo = nuevoPeriodo => {
        setPeriodoID(nuevoPeriodo)
        setEstudianteSeleccionado('')
        setFiltroEstudiante('')
        setFacturaSeleccionada(null)
    }

    const seleccionarEstudiante = id => {
        setEstudianteSeleccionado(id)
        setFiltroEstudiante(id)
        setFacturaSeleccionada(null)
    }

    const cambiarFiltroEstudiante = valor => {
        setFiltroEstudiante(valor)
        setEstudianteSeleccionado('')
        setFacturaSeleccionada(null)
    }

    const facturasFiltradas = facturasPendientes.filter(f => {
        const termino = normalizarTexto(filtroEstudiante.trim())
        if (!termino) return true
        const nombre = mapaEstudiantes[f.identificacionEstudiante] || ''
        return (
            normalizarTexto(f.identificacionEstudiante).includes(termino) ||
            normalizarTexto(nombre).includes(termino) ||
            normalizarTexto(f.facturaID).includes(termino)
        )
    })

    const manejarRegistrarPago = async () => {
        if (!facturaSeleccionada) {
            setNotification({
                type: 'error',
                message: 'Debe seleccionar una factura pendiente para registrar el pago.'
            })
            return
        }

        if (guardando) return
        setGuardando(true)

        try {
            await pagoService.create(facturaSeleccionada.facturaID)

            navigate('/pagos', {
                state: {
                    mensaje: `Pago registrado exitosamente. La factura #${facturaSeleccionada.facturaID} fue cancelada.`
                }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorPago(error, 'No se pudo registrar el pago.')
            })
            setGuardando(false)
        }
    }

    const obtenerNombreCurso = codigo => {
        if (!codigo) return '-'
        return mapaCursos[codigo.toUpperCase()] || codigo
    }

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title="Registrar Pago" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={estiloBoton}
                        onClick={() => navigate('/pagos')}
                        disabled={guardando}
                        title="Volver al listado"
                        aria-label="Volver al listado"
                    >
                        <i className="bi bi-arrow-left fs-5" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={estiloBoton}
                        onClick={manejarRegistrarPago}
                        disabled={guardando || !facturaSeleccionada}
                        title="Registrar Pago y Cancelar Factura"
                        aria-label="Registrar Pago y Cancelar Factura"
                    >
                        {guardando ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <i className="bi bi-floppy fs-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* 1. Selección de Estudiante y Factura */}
            <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light border-bottom py-3">
                    <span className="text-primary fw-semibold">
                        Selección de Estudiante y Factura
                    </span>
                </Card.Header>
                <Card.Body className="p-3">
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group controlId="periodoID">
                                <Form.Label className="small fw-semibold">
                                    Periodo <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    value={periodoID}
                                    onChange={e => cambiarPeriodo(e.target.value)}
                                    disabled={cargandoPeriodos || guardando}
                                >
                                    {cargandoPeriodos && (
                                        <option value="">Cargando periodos...</option>
                                    )}
                                    {periodos.map(p => (
                                        <option key={p.periodoID} value={p.periodoID}>
                                            {formatearNombrePeriodo(p)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group controlId="selectEstudiante">
                                <Form.Label className="small fw-semibold">
                                    Estudiantes Matriculados en el Periodo
                                </Form.Label>
                                <Form.Select
                                    value={estudianteSeleccionado}
                                    onChange={e => seleccionarEstudiante(e.target.value)}
                                    disabled={cargandoEstudiantes || guardando}
                                >
                                    <option value="">-- Seleccionar de la lista --</option>
                                    {estudiantes.map(e => (
                                        <option key={e.identificacion} value={e.identificacion}>
                                            {e.identificacion} - {e.nombreCompleto}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group controlId="filtroEstudiante">
                                <Form.Label className="small fw-semibold">
                                    Identificación Estudiante <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-group">
                                    <Form.Control
                                        type="text"
                                        placeholder="Ej: 112340567"
                                        value={filtroEstudiante}
                                        onChange={e => cambiarFiltroEstudiante(e.target.value)}
                                        disabled={guardando}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() => {}}
                                        disabled={guardando || !filtroEstudiante.trim()}
                                        title="Filtrar"
                                    >
                                        <i className="bi bi-search" />
                                    </button>
                                </div>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Label className="small fw-semibold">
                                Facturas Pendientes de Cobro ({facturasFiltradas.length})
                            </Form.Label>
                            {cargandoFacturas ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" variant="primary" />
                                    <span className="text-muted small ms-2">Cargando facturas pendientes...</span>
                                </div>
                            ) : facturasFiltradas.length === 0 ? (
                                <div className="alert alert-light border small text-muted mb-0">
                                    No hay facturas pendientes de cobro para el periodo o criterio seleccionado.
                                </div>
                            ) : (
                                <div className="table-responsive border rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <Table hover className="mb-0 align-middle small">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th style={{ width: '40px' }}></th>
                                                <th>N° Factura</th>
                                                <th>Estudiante</th>
                                                <th>Fecha Emisión</th>
                                                <th className="text-end">Total a Cancelar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {facturasFiltradas.map(f => {
                                                const esSeleccionada = facturaSeleccionada?.facturaID === f.facturaID
                                                return (
                                                    <tr
                                                        key={f.facturaID}
                                                        onClick={() => setFacturaSeleccionada(f)}
                                                        style={{ cursor: 'pointer' }}
                                                        className={esSeleccionada ? 'table-primary' : ''}
                                                    >
                                                        <td>
                                                            <Form.Check
                                                                type="radio"
                                                                name="facturaSeleccionada"
                                                                checked={esSeleccionada}
                                                                onChange={() => setFacturaSeleccionada(f)}
                                                            />
                                                        </td>
                                                        <td className="fw-semibold">#{f.facturaID}</td>
                                                        <td>
                                                            {f.identificacionEstudiante}
                                                            {mapaEstudiantes[f.identificacionEstudiante]
                                                                ? ` - ${mapaEstudiantes[f.identificacionEstudiante]}`
                                                                : ''}
                                                        </td>
                                                        <td>{formatearFecha(f.fechaEmision)}</td>
                                                        <td className="text-end fw-bold text-primary">
                                                            {formatearMoneda(f.total)}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Si hay una factura seleccionada, mostrar Encabezado, Detalle y Totales */}
            {facturaSeleccionada && (
                <>
                    {/* 2. Encabezado de la Factura */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-light border-bottom py-3">
                            <span className="text-primary fw-semibold">
                                Encabezado de la Factura
                            </span>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <Row className="g-3">
                                <Col md={3}>
                                    <div className="text-muted small">Estudiante</div>
                                    <div className="fw-semibold">
                                        {facturaSeleccionada.identificacionEstudiante}
                                        {mapaEstudiantes[facturaSeleccionada.identificacionEstudiante]
                                            ? ` - ${mapaEstudiantes[facturaSeleccionada.identificacionEstudiante]}`
                                            : ''}
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Periodo</div>
                                    <div className="fw-semibold">
                                        {formatearNombrePeriodo(periodos.find(p => p.periodoID === periodoID)) || periodoID}
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">Estado</div>
                                    <div>
                                        <Badge bg="warning" text="dark">
                                            {facturaSeleccionada.estado || 'Pendiente de Cobro'}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">N° Factura</div>
                                    <div className="fw-semibold">#{facturaSeleccionada.facturaID}</div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* 3. Detalle de la Factura (Líneas de Cobro) */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-light border-bottom py-3 d-flex justify-content-between align-items-center">
                            <span className="text-primary fw-semibold">
                                Detalle de la Factura (Líneas de Cobro)
                            </span>
                            <span className="badge bg-secondary">
                                {facturaSeleccionada.detalles?.length || 0} línea(s)
                            </span>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '60px' }}>#</th>
                                            <th>Materia</th>
                                            <th>Grupo</th>
                                            <th>Descripción</th>
                                            <th className="text-end">Monto Base</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!facturaSeleccionada.detalles || facturaSeleccionada.detalles.length === 0) ? (
                                            <tr>
                                                <td colSpan={5} className="text-center text-muted py-3">
                                                    No hay líneas de cobro registradas para esta factura
                                                </td>
                                            </tr>
                                        ) : (
                                            facturaSeleccionada.detalles.map((d, index) => (
                                                <tr key={d.detalleFacturaID || index}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-semibold">
                                                        {obtenerNombreCurso(d.cursoCode)}
                                                    </td>
                                                    <td>{d.grupoCode || mapaGrupos[d.cursoCode?.toUpperCase()] || '-'}</td>
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

                    {/* 4. Resumen de Totales */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Body className="p-3">
                            <Row className="justify-content-end">
                                <Col md={4}>
                                    <div className="d-flex justify-content-between py-1">
                                        <span className="text-muted">Subtotal:</span>
                                        <span className="fw-semibold">
                                            {formatearMoneda(facturaSeleccionada.subtotal)}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between py-1">
                                        <span className="text-muted">Impuesto (2%):</span>
                                        <span className="fw-semibold">
                                            {formatearMoneda(facturaSeleccionada.impuesto)}
                                        </span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between py-1">
                                        <span className="h5 fw-bold text-dark mb-0">Total:</span>
                                        <span className="h5 fw-bold text-primary mb-0">
                                            {formatearMoneda(facturaSeleccionada.total)}
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Botones de acción inferiores */}
                    <div className="d-flex justify-content-end gap-2 mb-4">
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/pagos')}
                            disabled={guardando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="success"
                            onClick={manejarRegistrarPago}
                            disabled={guardando}
                        >
                            {guardando ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Registrando Pago...
                                </>
                            ) : (
                                'Registrar Pago y Cancelar Factura'
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default CreatePago
