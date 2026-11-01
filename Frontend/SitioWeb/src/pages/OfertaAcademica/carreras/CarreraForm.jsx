import { useMemo, useState } from 'react'
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import useCatalogosCarrera from '../../../hooks/useCatalogosCarrera'
import {
    mensajeErrorCarrera,
    normalizarTextoCarrera,
    textoBusquedaCarrera
} from '../../../utils/carreraUtils'

const CODIGO_CARRERA = /^[A-Z0-9]{1,15}$/
const NOMBRE_CARRERA = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/

export default function CarreraForm({
    titulo,
    inicial = {},
    esEdicion = false,
    onGuardar,
    onCancelar
}) {
    const {
        instituciones,
        profesores,
        loading: cargandoCatalogos,
        error: errorCatalogos
    } = useCatalogosCarrera()
    const [datos, setDatos] = useState({
        carreraCode: inicial.carreraCode || '',
        institucionCode: inicial.institucionCode || '',
        directorID: inicial.directorID || '',
        nombre: inicial.nombre || ''
    })
    const [busquedaDirector, setBusquedaDirector] = useState('')
    const [errores, setErrores] = useState({})
    const [notification, setNotification] = useState(null)
    const [guardando, setGuardando] = useState(false)

    const profesoresFiltrados = useMemo(() => {
        const termino = textoBusquedaCarrera(busquedaDirector.trim())
        if (!termino) return profesores

        return profesores.filter(profesor =>
            textoBusquedaCarrera(profesor.nombreCompleto).includes(termino) ||
            textoBusquedaCarrera(profesor.identificacion).includes(termino)
        )
    }, [busquedaDirector, profesores])

    const cambiarCampo = (campo, valor) => {
        setDatos(actual => ({ ...actual, [campo]: valor }))
        setErrores(actual => ({ ...actual, [campo]: '' }))
    }

    const manejarSubmit = async event => {
        event.preventDefault()

        const codigo = String(datos.carreraCode)
        const nombre = normalizarTextoCarrera(datos.nombre)
        const profesorSeleccionado = profesores.find(
            profesor =>
                String(profesor.profesorID).toLowerCase() ===
                String(datos.directorID).toLowerCase()
        )
        const directorID = profesorSeleccionado?.profesorID || ''
        const institucionExiste = instituciones.some(
            institucion => institucion.institucionCode === datos.institucionCode
        )
        const nuevosErrores = {}

        if (!esEdicion && !codigo.trim()) {
            nuevosErrores.carreraCode = 'El código es requerido.'
        } else if (!esEdicion && !CODIGO_CARRERA.test(codigo)) {
            nuevosErrores.carreraCode =
                'Use solo letras mayúsculas y dígitos (máximo 15).'
        }

        if (!esEdicion && !datos.institucionCode.trim()) {
            nuevosErrores.institucionCode = 'Seleccione una institución.'
        } else if (!esEdicion && !institucionExiste) {
            nuevosErrores.institucionCode =
                'La institución seleccionada no está disponible.'
        }

        if (!nombre) {
            nuevosErrores.nombre = 'El nombre es requerido.'
        } else if (nombre.length > 150) {
            nuevosErrores.nombre = 'El nombre no puede superar 150 caracteres.'
        } else if (!NOMBRE_CARRERA.test(nombre)) {
            nuevosErrores.nombre = 'Use solo letras y espacios.'
        }

        if (!String(datos.directorID).trim()) {
            nuevosErrores.directorID = 'Seleccione un director.'
        } else if (!profesorSeleccionado) {
            nuevosErrores.directorID =
                'El director seleccionado no existe en la lista de profesores.'
        }

        setErrores(nuevosErrores)
        setNotification(null)

        if (Object.keys(nuevosErrores).length > 0) return

        setGuardando(true)

        try {
            const solicitud = esEdicion
                ? { nombre, directorID }
                : {
                    carreraCode: codigo,
                    institucionCode: datos.institucionCode,
                    directorID,
                    nombre
                }

            await onGuardar(solicitud)
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorCarrera(
                    error,
                    esEdicion
                        ? 'No se pudo actualizar la carrera.'
                        : 'No se pudo crear la carrera.'
                )
            })
        } finally {
            setGuardando(false)
        }
    }

    const formularioBloqueado = guardando || cargandoCatalogos || !!errorCatalogos

    return (
        <>
            <PageHeader title={titulo} />

            <Notification
                type={errorCatalogos ? 'error' : notification?.type}
                message={errorCatalogos || notification?.message}
                show={!!errorCatalogos || !!notification}
                onClose={() => setNotification(null)}
            />

            <Form onSubmit={manejarSubmit} noValidate>
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={onCancelar}
                        disabled={guardando}
                    >
                        <i className="bi bi-arrow-left me-2" />
                        Regresar
                    </Button>
                    <Button type="submit" disabled={formularioBloqueado}>
                        {guardando ? (
                            <Spinner size="sm" className="me-2" />
                        ) : (
                            <i className="bi bi-floppy me-2" />
                        )}
                        Guardar
                    </Button>
                </div>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light border-bottom py-3">
                        <span className="text-primary fw-semibold">
                            Información de la carrera
                        </span>
                    </Card.Header>
                    <Card.Body>
                        {cargandoCatalogos ? (
                            <div className="text-center p-3">
                                <Spinner animation="border" size="sm" />
                                <span className="ms-2">Cargando instituciones y profesores...</span>
                            </div>
                        ) : (
                            <fieldset
                                disabled={formularioBloqueado}
                                className="border-0 p-0 m-0 w-100"
                            >
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group controlId="carreraCode">
                                            <Form.Label>Código *</Form.Label>
                                            <Form.Control
                                                value={datos.carreraCode}
                                                maxLength={15}
                                                readOnly={esEdicion}
                                                required
                                                isInvalid={!!errores.carreraCode}
                                                onChange={event => cambiarCampo(
                                                    'carreraCode',
                                                    event.target.value
                                                )}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errores.carreraCode}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="carreraInstitucion">
                                            <Form.Label>Institución *</Form.Label>
                                            {esEdicion ? (
                                                <Form.Control
                                                    value={inicial.institucionNombre
                                                        ? `${datos.institucionCode} - ${inicial.institucionNombre}`
                                                        : datos.institucionCode}
                                                    readOnly
                                                />
                                            ) : (
                                                <Form.Select
                                                    value={datos.institucionCode}
                                                    required
                                                    isInvalid={!!errores.institucionCode}
                                                    onChange={event => cambiarCampo(
                                                        'institucionCode',
                                                        event.target.value
                                                    )}
                                                >
                                                    <option value="">Seleccione una institución</option>
                                                    {instituciones.map(institucion => (
                                                        <option
                                                            key={institucion.institucionCode}
                                                            value={institucion.institucionCode}
                                                        >
                                                            {institucion.institucionCode} - {institucion.nombre}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            )}
                                            <Form.Control.Feedback type="invalid">
                                                {errores.institucionCode}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="carreraNombre">
                                            <Form.Label>Nombre *</Form.Label>
                                            <Form.Control
                                                value={datos.nombre}
                                                maxLength={150}
                                                required
                                                isInvalid={!!errores.nombre}
                                                onChange={event => cambiarCampo(
                                                    'nombre',
                                                    event.target.value
                                                )}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errores.nombre}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="busquedaDirector">
                                            <Form.Label>Buscar director por nombre o identificación</Form.Label>
                                            <Form.Control
                                                type="search"
                                                value={busquedaDirector}
                                                placeholder="Buscar profesor"
                                                onChange={event => setBusquedaDirector(
                                                    event.target.value
                                                )}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="carreraDirector">
                                            <Form.Label>Director *</Form.Label>
                                            <Form.Select
                                                value={datos.directorID}
                                                required
                                                isInvalid={!!errores.directorID}
                                                onChange={event => cambiarCampo(
                                                    'directorID',
                                                    event.target.value
                                                )}
                                            >
                                                <option value="">Seleccione un director</option>
                                                {datos.directorID &&
                                                    !profesoresFiltrados.some(
                                                        profesor => profesor.profesorID === datos.directorID
                                                    ) && (
                                                        <option value={datos.directorID}>
                                                            {profesores.find(
                                                                profesor => profesor.profesorID === datos.directorID
                                                            )?.nombreCompleto || datos.directorID}
                                                        </option>
                                                    )}
                                                {profesoresFiltrados.map(profesor => (
                                                    <option
                                                        key={profesor.profesorID}
                                                        value={profesor.profesorID}
                                                    >
                                                        {profesor.nombreCompleto || profesor.profesorID}
                                                        {profesor.identificacion
                                                            ? ` - ${profesor.identificacion}`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errores.directorID}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </fieldset>
                        )}
                    </Card.Body>
                </Card>
            </Form>
        </>
    )
}
