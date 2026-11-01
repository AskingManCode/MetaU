import { useState } from 'react'
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import {
    mensajeErrorInstitucion,
    normalizarNombreInstitucion
} from '../../../utils/institucionUtils'

const CODIGO_INSTITUCION = /^[A-Z0-9]{1,15}$/
const NOMBRE_INSTITUCION = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/

export default function InstitucionForm({
    titulo,
    initial,
    edicion = false,
    onGuardar,
    onCancelar
}) {
    const [codigo, setCodigo] = useState(initial.institucionCode || '')
    const [nombre, setNombre] = useState(initial.nombre || '')
    const [errores, setErrores] = useState({})
    const [notification, setNotification] = useState(null)
    const [guardando, setGuardando] = useState(false)

    const guardar = async event => {
        event.preventDefault()

        const codigoActual = String(codigo)
        const nombreNormalizado = normalizarNombreInstitucion(nombre)
        const nuevosErrores = {}

        if (!edicion && !codigoActual.trim()) {
            nuevosErrores.codigo = 'El código es requerido.'
        } else if (!edicion && !CODIGO_INSTITUCION.test(codigoActual)) {
            nuevosErrores.codigo =
                'Use solo letras mayúsculas y dígitos (máximo 15).'
        }

        if (!nombreNormalizado) {
            nuevosErrores.nombre = 'El nombre es requerido.'
        } else if (nombreNormalizado.length > 150) {
            nuevosErrores.nombre = 'El nombre no puede superar 150 caracteres.'
        } else if (!NOMBRE_INSTITUCION.test(nombreNormalizado)) {
            nuevosErrores.nombre = 'Use solo letras y espacios.'
        }

        setErrores(nuevosErrores)
        setNotification(null)

        if (Object.keys(nuevosErrores).length > 0) {
            return
        }

        setGuardando(true)

        try {
            const datos = edicion
                ? { nombre: nombreNormalizado }
                : {
                    institucionCode: codigoActual,
                    nombre: nombreNormalizado
                }

            await onGuardar(datos)
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorInstitucion(
                    error,
                    edicion
                        ? 'No se pudo actualizar la institución.'
                        : 'No se pudo crear la institución.'
                )
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <>
            <PageHeader title={titulo} />

            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <Form onSubmit={guardar} noValidate>
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body d-flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={onCancelar}
                            disabled={guardando}
                        >
                            <i className="bi bi-arrow-left me-2" />
                            Regresar al listado
                        </Button>

                        <Button type="submit" disabled={guardando}>
                            {guardando ? (
                                <Spinner size="sm" className="me-2" />
                            ) : (
                                <i className="bi bi-floppy me-2" />
                            )}
                            Guardar
                        </Button>
                    </div>
                </div>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light text-primary fw-semibold py-3">
                        Datos de la institución
                    </Card.Header>
                    <Card.Body>
                        <Row className="g-3">
                            {!edicion && (
                                <Col md={6}>
                                    <Form.Group controlId="institucionCode">
                                        <Form.Label>Código *</Form.Label>
                                        <Form.Control
                                            value={codigo}
                                            maxLength={15}
                                            required
                                            isInvalid={!!errores.codigo}
                                            onChange={event => {
                                                setCodigo(event.target.value)
                                                setErrores(actual => ({
                                                    ...actual,
                                                    codigo: ''
                                                }))
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errores.codigo}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            )}

                            {edicion && (
                                <Col md={6}>
                                    <Form.Group controlId="institucionCode">
                                        <Form.Label>Código</Form.Label>
                                        <Form.Control
                                            value={codigo}
                                            readOnly
                                            plaintext
                                        />
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={6}>
                                <Form.Group controlId="institucionNombre">
                                    <Form.Label>Nombre *</Form.Label>
                                    <Form.Control
                                        value={nombre}
                                        maxLength={150}
                                        required
                                        isInvalid={!!errores.nombre}
                                        onChange={event => {
                                            setNombre(event.target.value)
                                            setErrores(actual => ({
                                                ...actual,
                                                nombre: ''
                                            }))
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errores.nombre}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Form>
        </>
    )
}
