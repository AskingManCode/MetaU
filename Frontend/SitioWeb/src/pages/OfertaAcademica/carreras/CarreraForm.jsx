import { useMemo, useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import Notification from '../../../components/Notification'
import useCatalogosCarrera from '../../../hooks/useCatalogosCarrera'
import {
    mensajeErrorCarrera,
    normalizarTextoCarrera,
    textoBusquedaCarrera
} from '../../../utils/carreraUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

const CODIGO_CARRERA = /^[A-Z0-9]{1,15}$/
const NOMBRE_CARRERA = /^[\p{L}]+(?: +[\p{L}]+)*$/u

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
        carreraCode: inicial.carreraCode ?? '',
        institucionCode: inicial.institucionCode ?? '',
        directorID: inicial.directorID ?? '',
        nombre: inicial.nombre ?? ''
    })
    const [busquedaDirector, setBusquedaDirector] = useState('')
    const [errores, setErrores] = useState({})
    const [notification, setNotification] = useState(null)
    const [guardando, setGuardando] = useState(false)

    const profesoresFiltrados = useMemo(() => {
        const termino = textoBusquedaCarrera(busquedaDirector.trim())
        const filtrados = profesores.filter(profesor =>
            textoBusquedaCarrera(profesor.nombreCompleto).includes(termino) ||
            textoBusquedaCarrera(profesor.identificacion).includes(termino)
        )
        const seleccionado = profesores.find(profesor =>
            String(profesor.profesorID).toLowerCase() ===
            String(datos.directorID).toLowerCase()
        )

        return seleccionado && !filtrados.includes(seleccionado)
            ? [seleccionado, ...filtrados]
            : filtrados
    }, [busquedaDirector, datos.directorID, profesores])

    const institucionSeleccionada = instituciones.find(
        institucion => institucion.institucionCode === datos.institucionCode
    )
    const profesorSeleccionado = profesores.find(profesor =>
        String(profesor.profesorID).toLowerCase() ===
        String(datos.directorID).toLowerCase()
    )

    const cambiarCampo = (campo, valor) => {
        setDatos(actual => ({ ...actual, [campo]: valor }))
        setErrores(actual => ({ ...actual, [campo]: '' }))
    }

    const manejarSubmit = async event => {
        event.preventDefault()

        const codigo = String(datos.carreraCode).trim().toUpperCase()
        const nombre = normalizarTextoCarrera(datos.nombre)
        const directorID = profesorSeleccionado?.profesorID ?? ''
        const institucionExiste = instituciones.some(
            institucion => institucion.institucionCode === datos.institucionCode
        )
        const nuevosErrores = {}

        if (!esEdicion && !codigo) {
            nuevosErrores.carreraCode = 'El código es requerido.'
        } else if (!esEdicion && !CODIGO_CARRERA.test(codigo)) {
            nuevosErrores.carreraCode =
                'Use solo letras mayúsculas y dígitos (máximo 15).'
        }

        if (!datos.institucionCode) {
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
        } else if (!directorID) {
            nuevosErrores.directorID =
                'El director seleccionado no existe en la lista de profesores.'
        }

        setErrores(nuevosErrores)
        setNotification(null)
        if (Object.keys(nuevosErrores).length > 0) return

        if (cargandoCatalogos || errorCatalogos) {
            setNotification({
                type: 'error',
                message: errorCatalogos ||
                    'Espere a que se carguen las instituciones y los profesores.'
            })
            return
        }

        setGuardando(true)
        try {
            await onGuardar(esEdicion
                ? { nombre, directorID }
                : {
                    carreraCode: codigo,
                    institucionCode: datos.institucionCode,
                    directorID,
                    nombre
                })
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

    const formularioBloqueado =
        guardando || cargandoCatalogos || !!errorCatalogos

    return (
        <div>
            <PageHeader title={titulo} />

            <Notification
                type={errorCatalogos ? 'error' : notification?.type}
                message={errorCatalogos || notification?.message}
                show={!!errorCatalogos || !!notification}
                onClose={() => setNotification(null)}
            />

            <div className="d-flex gap-2 mb-3">
                <button
                    type="button"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    onClick={onCancelar}
                    disabled={guardando}
                    title="Volver al listado"
                    aria-label="Volver al listado"
                >
                    <i className="bi bi-arrow-left fs-5" />
                </button>

                <button
                    type="submit"
                    form="formularioCarrera"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    disabled={formularioBloqueado}
                    title="Guardar"
                    aria-label="Guardar"
                >
                    {guardando
                        ? <Spinner animation="border" size="sm" />
                        : <i className="bi bi-floppy fs-5" />}
                </button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom py-3">
                    <span className="text-primary fw-semibold">
                        Información de la carrera
                    </span>
                </Card.Header>

                <Card.Body className="p-3">
                    {cargandoCatalogos ? (
                        <div className="text-center p-3">
                            <Spinner animation="border" size="sm" />
                            <span className="ms-2">
                                Cargando instituciones y profesores...
                            </span>
                        </div>
                    ) : (
                        <Form
                            id="formularioCarrera"
                            noValidate
                            onSubmit={manejarSubmit}
                        >
                            <fieldset
                                disabled={formularioBloqueado}
                                className="border-0 p-0 m-0 w-100"
                            >
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group controlId="carreraCodigo">
                                            <Form.Label>Código *</Form.Label>
                                            <Form.Control
                                                value={datos.carreraCode}
                                                readOnly={esEdicion}
                                                maxLength={15}
                                                isInvalid={!!errores.carreraCode}
                                                onChange={event => cambiarCampo(
                                                    'carreraCode',
                                                    event.target.value.toUpperCase()
                                                )}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errores.carreraCode}
                                            </Form.Control.Feedback>
                                            {!esEdicion && (
                                                <Form.Text className="text-muted">
                                                    Solo letras mayúsculas y números, máximo 15 caracteres
                                                </Form.Text>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="carreraInstitucion">
                                            <Form.Label>Institución *</Form.Label>
                                            {esEdicion ? (
                                                <Form.Control
                                                    value={
                                                        institucionSeleccionada?.nombre ||
                                                        datos.institucionCode
                                                    }
                                                    readOnly
                                                    required
                                                />
                                            ) : (
                                                <Form.Select
                                                    value={datos.institucionCode}
                                                    isInvalid={!!errores.institucionCode}
                                                    onChange={event => cambiarCampo(
                                                        'institucionCode',
                                                        event.target.value
                                                    )}
                                                    required
                                                >
                                                    <option value="">
                                                        Seleccione una institución
                                                    </option>
                                                    {instituciones.map(institucion => (
                                                        <option
                                                            key={institucion.institucionCode}
                                                            value={institucion.institucionCode}
                                                        >
                                                            {institucion.nombre}
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
                                        <Form.Group>
                                            <Form.Label htmlFor="carreraDirectorSelect">
                                                Director *
                                            </Form.Label>
                                            <Form.Control
                                                className="mb-2"
                                                value={busquedaDirector}
                                                placeholder="Buscar por nombre o identificación"
                                                aria-label="Buscar profesor"
                                                onChange={event => setBusquedaDirector(
                                                    event.target.value
                                                )}
                                            />
                                            <Form.Select
                                                id="carreraDirectorSelect"
                                                value={
                                                    profesorSeleccionado?.profesorID ??
                                                    datos.directorID
                                                }
                                                isInvalid={!!errores.directorID}
                                                onChange={event => cambiarCampo(
                                                    'directorID',
                                                    event.target.value
                                                )}
                                                required
                                            >
                                                <option value="">
                                                    Seleccione un profesor
                                                </option>
                                                {profesoresFiltrados.map(profesor => (
                                                    <option
                                                        key={profesor.profesorID}
                                                        value={profesor.profesorID}
                                                    >
                                                        {profesor.nombreCompleto}
                                                        {profesor.identificacion
                                                            ? ` (${profesor.identificacion})`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errores.directorID}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group controlId="carreraNombre">
                                            <Form.Label>Nombre *</Form.Label>
                                            <Form.Control
                                                value={datos.nombre}
                                                maxLength={150}
                                                isInvalid={!!errores.nombre}
                                                onChange={event => cambiarCampo(
                                                    'nombre',
                                                    event.target.value
                                                )}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errores.nombre}
                                            </Form.Control.Feedback>
                                            <Form.Text className="text-muted">
                                                Solo letras y espacios
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </fieldset>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </div>
    )
}
