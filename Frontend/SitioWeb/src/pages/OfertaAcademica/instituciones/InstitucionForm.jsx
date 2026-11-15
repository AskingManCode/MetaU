import { useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

const CODIGO_INSTITUCION = /^[A-Z0-9]{1,15}$/
const NOMBRE_INSTITUCION = /^[\p{L}]+(?: +[\p{L}]+)*$/u

function InstitucionForm({
    titulo,
    inicial,
    onGuardar,
    onCancelar,
    guardando,
    esEdicion = false
}) {
    const [codigo, setCodigo] = useState(inicial?.institucionCode ?? '')
    const [nombre, setNombre] = useState(inicial?.nombre ?? '')
    const [errores, setErrores] = useState({})

    const manejarSubmit = event => {
        event.preventDefault()

        const codigoNormalizado = String(codigo).trim()
        const nombreNormalizado = String(nombre).trim().replace(/ +/g, ' ')
        const nuevosErrores = {}

        if (!esEdicion && !codigoNormalizado) {
            nuevosErrores.codigo = 'El código es requerido.'
        } else if (!esEdicion && !CODIGO_INSTITUCION.test(codigoNormalizado)) {
            nuevosErrores.codigo = 'Use solo letras mayúsculas y dígitos (máximo 15).'
        }

        if (!nombreNormalizado) {
            nuevosErrores.nombre = 'El nombre es requerido.'
        } else if (nombreNormalizado.length > 150) {
            nuevosErrores.nombre = 'El nombre no puede superar 150 caracteres.'
        } else if (!NOMBRE_INSTITUCION.test(nombreNormalizado)) {
            nuevosErrores.nombre = 'Use solo letras y espacios.'
        }

        setErrores(nuevosErrores)
        if (Object.keys(nuevosErrores).length > 0) return

        onGuardar(esEdicion
            ? { nombre: nombreNormalizado }
            : { institucionCode: codigoNormalizado, nombre: nombreNormalizado })
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
                    form="formularioInstitucion"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    disabled={guardando}
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
                        Información de la Institución
                    </span>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioInstitucion" noValidate onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                {!esEdicion && (
                                    <Col md={6}>
                                        <Form.Group controlId="institucionCodigo">
                                            <Form.Label>Código *</Form.Label>
                                            <Form.Control
                                                value={codigo}
                                                maxLength={15}
                                                isInvalid={!!errores.codigo}
                                                onChange={event => {
                                                    setCodigo(event.target.value.toUpperCase())
                                                    setErrores(actual => ({
                                                        ...actual,
                                                        codigo: ''
                                                    }))
                                                }}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errores.codigo}
                                            </Form.Control.Feedback>
                                            <Form.Text className="text-muted">
                                                Solo letras mayúsculas y números, máximo 15 caracteres
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                )}

                                {esEdicion && (
                                    <Col md={6}>
                                        <Form.Group controlId="institucionCodigo">
                                            <Form.Label>Código</Form.Label>
                                            <Form.Control value={codigo} readOnly />
                                        </Form.Group>
                                    </Col>
                                )}

                                <Col md={6}>
                                    <Form.Group controlId="institucionNombre">
                                        <Form.Label>Nombre *</Form.Label>
                                        <Form.Control
                                            value={nombre}
                                            maxLength={150}
                                            isInvalid={!!errores.nombre}
                                            onChange={event => {
                                                setNombre(event.target.value)
                                                setErrores(actual => ({
                                                    ...actual,
                                                    nombre: ''
                                                }))
                                            }}
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
                </Card.Body>
            </Card>
        </div>
    )
}

export default InstitucionForm
