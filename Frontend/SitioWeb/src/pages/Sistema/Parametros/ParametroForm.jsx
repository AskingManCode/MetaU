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

const PATRON_CODIGO = /^[A-Z]{1,10}$/
const MAX_VALOR = 500

const validar = datos => {
    const parametroCode = datos.parametroCode.trim()
    const valor = datos.valor.trim().replace(/ +/g, ' ')

    if (!parametroCode) {
        return 'El codigo es obligatorio'
    }

    if (!PATRON_CODIGO.test(parametroCode)) {
        return 'El codigo solo puede tener letras mayusculas sin espacios ni numeros y maximo 10 caracteres'
    }

    if (!valor) {
        return 'El valor es obligatorio'
    }

    if (valor.length > MAX_VALOR) {
        return 'El valor no puede tener mas de 500 caracteres'
    }

    return null
}

function ParametroForm({ titulo, inicial, onGuardar, onCancelar, guardando, esEdicion = false }) {
    const [datos, setDatos] = useState({
        parametroCode: inicial?.parametroCode ?? '',
        valor: inicial?.valor ?? ''
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
            parametroCode: datos.parametroCode.trim(),
            valor: datos.valor.trim().replace(/ +/g, ' ')
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
                    form="formularioParametro"
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
                    <span className="text-primary fw-semibold">Informacion del Parametro</span>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioParametro" noValidate onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="parametroCodigo">
                                        <Form.Label>Codigo *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: PAGSIZE"
                                            value={datos.parametroCode}
                                            readOnly={esEdicion}
                                            maxLength={10}
                                            onChange={e => cambiarCampo('parametroCode', e.target.value.toUpperCase())}
                                        />
                                        <Form.Text className="text-muted">
                                            Solo letras mayusculas, sin espacios ni numeros (maximo 10 caracteres)
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="parametroValor">
                                        <Form.Label>Valor *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el valor del parametro"
                                            value={datos.valor}
                                            maxLength={MAX_VALOR}
                                            onChange={e => cambiarCampo('valor', e.target.value)}
                                        />
                                        <Form.Text className="text-muted">
                                            Texto libre, maximo 500 caracteres ({datos.valor.length}/{MAX_VALOR})
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

export default ParametroForm
