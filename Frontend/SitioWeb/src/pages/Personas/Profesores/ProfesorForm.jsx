
import { useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import { prepararProfesorRequest } from '../../../utils/profesorUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function ProfesorForm({ titulo, inicial, onGuardar, onCancelar, guardando, esEdicion = false }) {
    const [datos, setDatos] = useState({
        usuarioID: inicial?.usuarioID ?? '',
        tipoIdentificacionCode: inicial?.tipoIdentificacionCode ?? '',
        identificacion: inicial?.identificacion ?? '',
        email: inicial?.email ?? '',
        nombreCompleto: inicial?.nombreCompleto ?? '',
        fechaNacimiento: inicial?.fechaNacimiento ?? '',
        telefonos: inicial?.telefonos?.length ? [...inicial.telefonos] : ['']
    })

    const cambiarCampo = (campo, valor) => {
        setDatos(actual => ({ ...actual, [campo]: valor }))
    }

    const cambiarTelefono = (indice, valor) => {
        setDatos(actual => ({
            ...actual,
            telefonos: actual.telefonos.map((telefono, i) => i === indice ? valor : telefono)
        }))
    }

    const agregarTelefono = () => {
        setDatos(actual => ({ ...actual, telefonos: [...actual.telefonos, ''] }))
    }

    const quitarTelefono = indice => {
        setDatos(actual => ({
            ...actual,
            telefonos: actual.telefonos.filter((_, i) => i !== indice)
        }))
    }

    const manejarSubmit = e => {
        e.preventDefault()
        onGuardar(prepararProfesorRequest(datos))
    }

    return (
        <div>
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
                    form="formularioProfesor"
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
                    <span className="text-primary fw-semibold">Informacion del Profesor</span>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioProfesor" onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="profesorUsuario">
                                        <Form.Label>Usuario asociado (GUID) *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el GUID del usuario"
                                            value={datos.usuarioID}
                                            readOnly={esEdicion}
                                            onChange={e => cambiarCampo('usuarioID', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="profesorTipoIdentificacion">
                                        <Form.Label>Tipo de identificacion *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el tipo de identificacion"
                                            value={datos.tipoIdentificacionCode}
                                            onChange={e => cambiarCampo('tipoIdentificacionCode', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="profesorIdentificacion">
                                        <Form.Label>Identificacion *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese la identificacion"
                                            value={datos.identificacion}
                                            onChange={e => cambiarCampo('identificacion', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="profesorNombre">
                                        <Form.Label>Nombre completo *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el nombre completo"
                                            value={datos.nombreCompleto}
                                            onChange={e => cambiarCampo('nombreCompleto', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="profesorCorreo">
                                        <Form.Label>Correo electronico *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Ingrese el correo electronico"
                                            value={datos.email}
                                            onChange={e => cambiarCampo('email', e.target.value)}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            El correo debe cumplir el dominio configurado en el sistema
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="profesorNacimiento">
                                        <Form.Label>Fecha de nacimiento *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={datos.fechaNacimiento}
                                            onChange={e => cambiarCampo('fechaNacimiento', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12}>
                                    <Form.Label>Telefonos *</Form.Label>

                                    {datos.telefonos.map((telefono, indice) => (
                                        <div className="d-flex align-items-center gap-2 mb-2" key={indice}>
                                            <Form.Control
                                                type="tel"
                                                placeholder="8888-8888"
                                                aria-label={`Telefono ${indice + 1}`}
                                                pattern="[0-9]{4}[- ]?[0-9]{4}"
                                                title="Ingrese 8 digitos, con o sin guion"
                                                value={telefono}
                                                onChange={e => cambiarTelefono(indice, e.target.value)}
                                                required
                                            />

                                            {datos.telefonos.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                    style={estiloBoton}
                                                    onClick={() => quitarTelefono(indice)}
                                                    title="Quitar telefono"
                                                    aria-label={`Quitar telefono ${indice + 1}`}
                                                >
                                                    <i className="bi bi-trash" />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                                        style={estiloBoton}
                                        onClick={agregarTelefono}
                                        title="Agregar telefono"
                                        aria-label="Agregar telefono"
                                    >
                                        <i className="bi bi-plus-lg" />
                                    </button>
                                </Col>
                            </Row>
                        </fieldset>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}

export default ProfesorForm
