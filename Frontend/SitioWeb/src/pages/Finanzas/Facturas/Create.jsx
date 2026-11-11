import { useEffect, useState } from 'react'
import { Alert, Badge, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import { obtenerEstado } from '../../../hooks/usePeriodos'
import cursoService from '../../../services/cursoService'
import facturaService from '../../../services/facturaService'
import listaEstudiantesService from '../../../services/listaEstudiantesService'
import matriculaService from '../../../services/matriculaService'
import periodoService from '../../../services/periodoService'
import {
    formatearMoneda,
    formatearNombrePeriodo,
    mensajeErrorFactura
} from '../../../utils/facturaUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

const COSTO_CURSO_DEFECTO = 30000
const PORCENTAJE_IMPUESTO = 0.02
const DESCRIPCION_DETALLE = 'Servicios estudiantiles'

function CreateFactura() {
    const navigate = useNavigate()

    const [periodos, setPeriodos] = useState([])
    const [periodoID, setPeriodoID] = useState('')
    const [estudiantes, setEstudiantes] = useState([])
    const [estudianteIdentificacion, setEstudianteIdentificacion] = useState('')
    const [cursosMatriculados, setCursosMatriculados] = useState([])
    const [mapaCursos, setMapaCursos] = useState({})

    const [cargandoPeriodos, setCargandoPeriodos] = useState(true)
    const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false)
    const [consultandoMatricula, setConsultandoMatricula] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [consultaRealizada, setConsultaRealizada] = useState(false)
    const [notification, setNotification] = useState(null)

    // Cargar periodos al montar
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
                    message: mensajeErrorFactura(error, 'No se pudieron cargar los periodos.')
                })
            })
            .finally(() => {
                if (activo) setCargandoPeriodos(false)
            })

        return () => { activo = false }
    }, [])

    // Cargar catálogo de materias/cursos para mostrar nombres legibles
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
            .catch(() => {
                if (!activo) return
                setMapaCursos({})
            })

        return () => { activo = false }
    }, [])

    // Cargar listado de estudiantes cuando cambie el periodo
    useEffect(() => {
        let activo = true
        if (!periodoID) return

        const cargarEstudiantes = async () => {
            setCargandoEstudiantes(true)
            try {
                const { data } = await listaEstudiantesService.getByPeriodo(periodoID)
                if (!activo) return
                const lista = Array.isArray(data) ? data : []
                const unicos = []
                const mapa = new Set()
                for (const item of lista) {
                    const id = item.identificacion || item.Identificacion
                    if (id && !mapa.has(id)) {
                        mapa.add(id)
                        unicos.push({
                            identificacion: id,
                            nombreCompleto: item.nombreCompleto || item.NombreCompleto || id
                        })
                    }
                }
                setEstudiantes(unicos)
            } catch {
                if (!activo) return
                setEstudiantes([])
            } finally {
                if (activo) setCargandoEstudiantes(false)
            }
        }

        cargarEstudiantes()

        return () => { activo = false }
    }, [periodoID])

    const cambiarPeriodo = nuevoPeriodo => {
        setPeriodoID(nuevoPeriodo)
        setCursosMatriculados([])
        setConsultaRealizada(false)
    }

    const seleccionarEstudiante = id => {
        setEstudianteIdentificacion(id)
        setCursosMatriculados([])
        setConsultaRealizada(false)
        if (id && periodoID) {
            consultarCursos(id, periodoID)
        }
    }

    const consultarCursos = async (idEstudiante, idPeriodo) => {
        const id = (idEstudiante ?? estudianteIdentificacion).trim()
        const per = idPeriodo ?? periodoID

        if (!id) {
            setNotification({
                type: 'warning',
                message: 'Debe ingresar o seleccionar la identificación del estudiante.'
            })
            return
        }

        if (!per) {
            setNotification({
                type: 'warning',
                message: 'Debe seleccionar un periodo.'
            })
            return
        }

        setConsultandoMatricula(true)
        setNotification(null)

        try {
            const { data } = await matriculaService.getAll({ identificacion: id })
            const lista = Array.isArray(data) ? data : []

            const delPeriodo = lista.filter(m => {
                const perMat = m.periodoID ?? m.PeriodoID
                return String(perMat).toLowerCase() === String(per).toLowerCase()
            })

            setCursosMatriculados(delPeriodo)
            setConsultaRealizada(true)

            if (delPeriodo.length === 0) {
                setNotification({
                    type: 'info',
                    message: 'El estudiante no tiene cursos matriculados en el periodo seleccionado.'
                })
            }
        } catch (error) {
            setCursosMatriculados([])
            setConsultaRealizada(true)
            setNotification({
                type: 'error',
                message: mensajeErrorFactura(error, 'Error al consultar la matrícula del estudiante.')
            })
        } finally {
            setConsultandoMatricula(false)
        }
    }

    // Cálculos financieros
    const subtotal = cursosMatriculados.length * COSTO_CURSO_DEFECTO
    const impuesto = subtotal * PORCENTAJE_IMPUESTO
    const total = subtotal + impuesto

    const obtenerNombreCurso = codigo => {
        if (!codigo) return '-'
        return mapaCursos[codigo.toUpperCase()] || codigo
    }

    const manejarSubmit = async e => {
        e.preventDefault()

        const id = estudianteIdentificacion.trim()
        if (!id) {
            setNotification({
                type: 'error',
                message: 'Debe ingresar o seleccionar un estudiante.'
            })
            return
        }

        if (!periodoID) {
            setNotification({
                type: 'error',
                message: 'Debe seleccionar un periodo.'
            })
            return
        }

        if (cursosMatriculados.length === 0) {
            setNotification({
                type: 'error',
                message: 'No se puede crear una factura sin cursos matriculados.'
            })
            return
        }

        if (guardando) return
        setGuardando(true)

        try {
            await facturaService.create({
                estudianteIdentificacion: id,
                monto: subtotal,
                periodoID: periodoID
            })

            navigate('/facturas', {
                state: { mensaje: 'Factura creada exitosamente - Pendiente de Cobro.' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorFactura(error, 'No se pudo crear la factura.')
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title="Nueva Factura" />

            <div className="d-flex gap-2 mb-3">
                <button
                    type="button"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    onClick={() => navigate('/facturas')}
                    disabled={guardando}
                    title="Volver al listado"
                    aria-label="Volver al listado"
                >
                    <i className="bi bi-arrow-left fs-5" />
                </button>

                <button
                    type="submit"
                    form="formularioFactura"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    disabled={guardando || cursosMatriculados.length === 0}
                    title="Guardar Factura"
                    aria-label="Guardar Factura"
                >
                    {guardando ? (
                        <Spinner animation="border" size="sm" />
                    ) : (
                        <i className="bi bi-floppy fs-5" />
                    )}
                </button>
            </div>

            <Form id="formularioFactura" noValidate onSubmit={manejarSubmit}>
                {/* 1. Selección de Estudiante / Matrícula */}
                <Card className="border-0 shadow-sm mb-3">
                    <Card.Header className="bg-light border-bottom py-3">
                        <span className="text-primary fw-semibold">
                            Selección de Estudiante y Matrícula
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
                                        required
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
                                        value={estudianteIdentificacion}
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
                                <Form.Group controlId="estudianteIdentificacion">
                                    <Form.Label className="small fw-semibold">
                                        Identificación Estudiante <span className="text-danger">*</span>
                                    </Form.Label>
                                    <div className="input-group">
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: 112340567"
                                            value={estudianteIdentificacion}
                                            onChange={e => {
                                                setEstudianteIdentificacion(e.target.value)
                                                setCursosMatriculados([])
                                                setConsultaRealizada(false)
                                            }}
                                            disabled={guardando}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => consultarCursos()}
                                            disabled={
                                                consultandoMatricula ||
                                                guardando ||
                                                !estudianteIdentificacion.trim()
                                            }
                                            title="Consultar Matrícula"
                                        >
                                            {consultandoMatricula ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <i className="bi bi-search" />
                                            )}
                                        </button>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* 2. Encabezado - Detalle Visible */}
                {consultaRealizada && cursosMatriculados.length === 0 && (
                    <Alert variant="warning" className="border-0 shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2" />
                        No se encontraron cursos matriculados para el estudiante en el periodo seleccionado.
                        No es posible generar una factura sin matrícula activa.
                    </Alert>
                )}

                {cursosMatriculados.length > 0 && (
                    <>
                        {/* Encabezado visible */}
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
                                        <div className="fw-semibold">{estudianteIdentificacion}</div>
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
                                                Pendiente de Cobro
                                            </Badge>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-muted small">Cursos a Facturar</div>
                                        <div className="fw-semibold">{cursosMatriculados.length} curso(s)</div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Detalle visible */}
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Header className="bg-light border-bottom py-3 d-flex justify-content-between align-items-center">
                                <span className="text-primary fw-semibold">
                                    Detalle de la Factura (Líneas de Cobro)
                                </span>
                                <span className="badge bg-secondary">
                                    {cursosMatriculados.length} línea(s)
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
                                            {cursosMatriculados.map((c, index) => (
                                                <tr key={c.matriculaID ?? c.MatriculaID ?? index}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-semibold">
                                                        {obtenerNombreCurso(c.cursoCode ?? c.CursoCode)}
                                                    </td>
                                                    <td>{c.grupoCode ?? c.GrupoCode ?? '-'}</td>
                                                    <td>{DESCRIPCION_DETALLE}</td>
                                                    <td className="text-end">{formatearMoneda(COSTO_CURSO_DEFECTO)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Resumen de Totales */}
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body className="p-3">
                                <Row className="justify-content-end">
                                    <Col md={4}>
                                        <div className="d-flex justify-content-between py-1">
                                            <span className="text-muted">Subtotal:</span>
                                            <span className="fw-semibold">{formatearMoneda(subtotal)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between py-1">
                                            <span className="text-muted">Impuesto (2%):</span>
                                            <span className="fw-semibold">{formatearMoneda(impuesto)}</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between py-1">
                                            <span className="h5 fw-bold text-dark mb-0">Total:</span>
                                            <span className="h5 fw-bold text-primary mb-0">
                                                {formatearMoneda(total)}
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </>
                )}
            </Form>
        </div>
    )
}

export default CreateFactura
