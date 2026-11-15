import { useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

const PATRON_CODIGO = /^[A-Z]{1,15}$/
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]+$/

const validar = datos => {
    const idRol = datos.idRol.trim()
    const nombre = datos.nombre.trim()

    if (!idRol) {
        return 'El codigo es obligatorio'
    }

    if (!PATRON_CODIGO.test(idRol)) {
        return 'El codigo solo puede tener letras mayusculas sin espacios ni numeros y maximo 15 caracteres'
    }

    if (!nombre) {
        return 'El nombre es obligatorio'
    }

    if (!PATRON_NOMBRE.test(nombre)) {
        return 'El nombre solo puede tener letras y espacios'
    }

    return null
}

function RolForm({ titulo, inicial, onGuardar, onCancelar, guardando, esEdicion = false }) {
    const [datos, setDatos] = useState({
        idRol: inicial?.idRol ?? '',
        nombre: inicial?.nombre ?? ''
    })
    const [notification, setNotification] = useState(null)

    const cambiarCampo = (campo, valor) => {
        setDatos(actual => ({ ...actual, [campo]: valor }))
    }

    const manejarSubmit = e => {
        e.preventDefault()

        const error = validar(datos)

        if (error) {
            setNotification({ type: 'error', message: error })
            return
        }

        setNotification(null)

        onGuardar({
            idRol: datos.idRol.trim(),
            nombre: datos.nombre.trim()
        })
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
                    form="formularioRol"
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
                    <span className="text-primary fw-semibold">Informacion del Rol</span>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioRol" noValidate onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="rolCodigo">
                                        <Form.Label>Codigo *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: ADM"
                                            value={datos.idRol}
                                            readOnly={esEdicion}
                                            maxLength={15}
                                            onChange={e => cambiarCampo('idRol', e.target.value.toUpperCase())}
                                        />
                                        <Form.Text className="text-muted">
                                            Solo letras mayusculas, sin espacios ni numeros
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="rolNombre">
                                        <Form.Label>Nombre *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el nombre del rol"
                                            value={datos.nombre}
                                            onChange={e => cambiarCampo('nombre', e.target.value)}
                                        />
                                        <Form.Text className="text-muted">
                                            Solo letras y espacios
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </fieldset>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}

export default RolForm