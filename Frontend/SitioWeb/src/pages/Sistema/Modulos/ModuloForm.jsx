import { useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function ModuloForm({ titulo, inicial, onGuardar, onCancelar, guardando, esEdicion = false }) {
    const [datos, setDatos] = useState({
        idModulo: inicial?.idModulo ?? '',
        nombre: inicial?.nombre ?? '',
        orden: inicial?.orden ?? '',
        estado: inicial?.estado ?? true
    })

    const cambiarCampo = (campo, valor) => {
        setDatos(actual => ({ ...actual, [campo]: valor }))
    }

    const manejarSubmit = e => {
        e.preventDefault()
        onGuardar({
            idModulo: datos.idModulo.trim(),
            nombre: datos.nombre.trim(),
            orden: Number(datos.orden),
            estado: datos.estado
        })
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
                    form="formularioModulo"
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
                    <span className="text-primary fw-semibold">Informacion del Modulo</span>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioModulo" onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="moduloCodigo">
                                        <Form.Label>Codigo *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: SEG"
                                            value={datos.idModulo}
                                            readOnly={esEdicion}
                                            maxLength={15}
                                            pattern="[A-Z]{1,15}"
                                            title="Solo letras mayusculas, maximo 15"
                                            onChange={e => cambiarCampo('idModulo', e.target.value.toUpperCase())}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Solo letras mayusculas, sin espacios ni numeros
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="moduloNombre">
                                        <Form.Label>Nombre *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el nombre del modulo"
                                            value={datos.nombre}
                                            pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]+"
                                            title="Solo letras y espacios"
                                            onChange={e => cambiarCampo('nombre', e.target.value)}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Solo letras y espacios
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="moduloOrden">
                                        <Form.Label>Orden en el menu *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            step={1}
                                            placeholder="Ej: 1"
                                            value={datos.orden}
                                            onChange={e => cambiarCampo('orden', e.target.value)}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Mayor o igual a 1 y no puede repetirse entre modulos
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="moduloEstado">
                                        <Form.Label>Estado</Form.Label>
                                        <Form.Check
                                            type="switch"
                                            id="moduloEstadoSwitch"
                                            label={datos.estado ? 'Activo' : 'Inactivo'}
                                            checked={datos.estado}
                                            onChange={e => cambiarCampo('estado', e.target.checked)}
                                        />
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

export default ModuloForm