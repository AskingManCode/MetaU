import { useEffect, useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import rolService from '../../../services/rolService'
import { normalizarRol } from '../../../utils/sistemaUtils'
import { DOMINIOS, TIPOS_IDENTIFICACION, formatearFecha } from '../../../utils/usuarioUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]+$/
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PATRON_IDENTIFICACION = /^[A-Za-z0-9]{9,}$/

const validar = (datos, esEdicion) => {
    const email = datos.email.trim().toLowerCase()
    const dominio = email.split('@')[1]

    if (!email) {
        return 'El email es obligatorio'
    }

    if (!PATRON_EMAIL.test(email)) {
        return 'El formato del email no es valido'
    }

    if (!DOMINIOS.includes(dominio)) {
        return 'El email debe pertenecer al dominio cuc.cr o cuc.ac.cr'
    }

    if (!datos.idRol) {
        return 'Debe seleccionar un rol'
    }

    if (dominio === 'cuc.cr' && datos.idRol !== 'EST') {
        return 'Los emails del dominio cuc.cr deben tener el rol Estudiante'
    }

    if (dominio === 'cuc.ac.cr' && !['PROF', 'ADM'].includes(datos.idRol)) {
        return 'Los emails del dominio cuc.ac.cr deben tener el rol Profesor o Administrativo'
    }

    if (!datos.tipoIdentificacion) {
        return 'Debe seleccionar un tipo de identificacion'
    }

    if (!datos.identificacion.trim()) {
        return 'La identificacion es obligatoria'
    }

    if (!PATRON_IDENTIFICACION.test(datos.identificacion.trim())) {
        return 'La identificacion debe tener minimo 9 caracteres y solo letras y numeros'
    }

    if (!datos.nombre.trim() || !PATRON_NOMBRE.test(datos.nombre.trim())) {
        return 'El nombre es obligatorio y solo puede tener letras y espacios'
    }

    if (!esEdicion && !datos.contrasena) {
        return 'La contrasena es obligatoria'
    }

    return null
}

function UsuarioForm({ titulo, inicial, onGuardar, onCancelar, guardando, esEdicion = false }) {
    const [datos, setDatos] = useState({
        email: inicial?.email ?? '',
        tipoIdentificacion: inicial?.tipoIdentificacion ?? '',
        identificacion: inicial?.identificacion ?? '',
        nombre: inicial?.nombre ?? '',
        idRol: inicial?.idRol ?? '',
        contrasena: ''
    })
    const [roles, setRoles] = useState([])
    const [cargandoRoles, setCargandoRoles] = useState(true)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        rolService.getAll()
            .then(({ data }) => {
                if (activo) setRoles(data.map(normalizarRol))
            })
            .catch(() => {
                if (activo) {
                    setNotification({
                        type: 'error',
                        message: 'No se pudo cargar la lista de roles'
                    })
                }
            })
            .finally(() => {
                if (activo) setCargandoRoles(false)
            })

        return () => { activo = false }
    }, [])

    const cambiarCampo = (campo, valor) => {
        setDatos(actual => ({ ...actual, [campo]: valor }))
    }

    const manejarSubmit = e => {
        e.preventDefault()

        const error = validar(datos, esEdicion)

        if (error) {
            setNotification({ type: 'error', message: error })
            return
        }

        setNotification(null)

        const cuerpo = {
            email: datos.email.trim(),
            tipoIdentificacion: datos.tipoIdentificacion,
            identificacion: datos.identificacion.trim(),
            nombre: datos.nombre.trim(),
            idRol: datos.idRol
        }

        if (datos.contrasena) cuerpo.contrasena = datos.contrasena

        onGuardar(cuerpo)
    }

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title={titulo} />

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
                    form="formularioUsuario"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    disabled={guardando}
                    title="Guardar"
                    aria-label="Guardar"
                >
                    {guardando ? <Spinner animation="border" size="sm" /> : <i className="bi bi-floppy fs-5" />}
                </button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom py-3">
                    <span className="text-primary fw-semibold">Informacion del Usuario</span>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioUsuario" noValidate onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="usuarioEmail">
                                        <Form.Label>Email *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="usuario@cuc.cr"
                                            value={datos.email}
                                            readOnly={esEdicion}
                                            onChange={e => cambiarCampo('email', e.target.value)}
                                        />
                                        <Form.Text className="text-muted">
                                            Dominio cuc.cr (estudiantes) o cuc.ac.cr (profesores y administrativos)
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="usuarioRol">
                                        <Form.Label>Rol *</Form.Label>
                                        <Form.Select
                                            value={datos.idRol}
                                            onChange={e => cambiarCampo('idRol', e.target.value)}
                                            disabled={cargandoRoles}
                                        >
                                            <option value="">
                                                {cargandoRoles ? 'Cargando roles...' : 'Seleccione un rol'}
                                            </option>
                                            {roles.map(r => (
                                                <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="usuarioTipo">
                                        <Form.Label>Tipo de identificacion *</Form.Label>
                                        <Form.Select
                                            value={datos.tipoIdentificacion}
                                            onChange={e => cambiarCampo('tipoIdentificacion', e.target.value)}
                                        >
                                            <option value="">Seleccione un tipo</option>
                                            {TIPOS_IDENTIFICACION.map(t => (
                                                <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="usuarioIdentificacion">
                                        <Form.Label>Identificacion *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Numero de identificacion"
                                            value={datos.identificacion}
                                            onChange={e => cambiarCampo('identificacion', e.target.value)}
                                        />
                                        <Form.Text className="text-muted">
                                            Minimo 9 caracteres, solo letras y numeros
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="usuarioNombre">
                                        <Form.Label>Nombre completo *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el nombre completo"
                                            value={datos.nombre}
                                            onChange={e => cambiarCampo('nombre', e.target.value)}
                                        />
                                        <Form.Text className="text-muted">
                                            Solo letras y espacios
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="usuarioContrasena">
                                        <Form.Label>Contrasena {esEdicion ? '' : '*'}</Form.Label>
                                        <Form.Control
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder={esEdicion ? 'Dejar en blanco para no cambiarla' : 'Ingrese la contrasena'}
                                            value={datos.contrasena}
                                            onChange={e => cambiarCampo('contrasena', e.target.value)}
                                        />
                                        {esEdicion && (
                                            <Form.Text className="text-muted">
                                                Es opcional al editar
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>

                                {esEdicion && (
                                    <Col md={12}>
                                        <small className="text-muted">
                                            Ultima modificacion: {formatearFecha(inicial?.fechaModificacion)}
                                        </small>
                                    </Col>
                                )}
                            </Row>
                        </fieldset>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}

export default UsuarioForm