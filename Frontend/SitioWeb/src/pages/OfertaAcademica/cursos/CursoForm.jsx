import { useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import useCarrerasCurso from '../../../hooks/useCarrerasCurso'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

const CODIGO_CURSO = /^[A-Z0-9]{1,15}$/
const NOMBRE_CURSO = /^[\p{L}]+(?: +[\p{L}]+)*$/u

function CursoForm({
    titulo,
    inicial,
    onGuardar,
    onCancelar,
    guardando,
    esEdicion = false
}) {
    const { carreras, loading: cargandoCarreras, error: errorCarreras } =
        useCarrerasCurso()
    const [curso, setCurso] = useState({
        cursoCode: inicial?.cursoCode ?? '',
        carreraCode: inicial?.carreraCode ?? '',
        nombre: inicial?.nombre ?? '',
        nivel: inicial?.nivel === undefined ? '' : String(inicial.nivel)
    })
    const [errores, setErrores] = useState({})

    const nombreCarrera = carreras.find(
        carrera => carrera.carreraCode === curso.carreraCode
    )?.nombre ?? curso.carreraCode

    const actualizarCampo = (campo, valor) => {
        setCurso(actual => ({ ...actual, [campo]: valor }))
        setErrores(actual => ({ ...actual, [campo]: '' }))
    }

    const manejarSubmit = event => {
        event.preventDefault()

        const codigoNormalizado = String(curso.cursoCode).trim().toUpperCase()
        const nombreNormalizado = String(curso.nombre).trim().replace(/ +/g, ' ')
        const nivel = Number(curso.nivel)
        const nuevosErrores = {}

        if (!codigoNormalizado) {
            nuevosErrores.cursoCode = 'El código es requerido.'
        } else if (!esEdicion && !CODIGO_CURSO.test(codigoNormalizado)) {
            nuevosErrores.cursoCode =
                'Use solo letras mayúsculas y dígitos (máximo 15).'
        }

        if (!curso.carreraCode) {
            nuevosErrores.carreraCode = 'Seleccione una carrera.'
        }

        if (!nombreNormalizado) {
            nuevosErrores.nombre = 'El nombre es requerido.'
        } else if (nombreNormalizado.length > 150) {
            nuevosErrores.nombre = 'El nombre no puede superar los 150 caracteres.'
        } else if (!NOMBRE_CURSO.test(nombreNormalizado)) {
            nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios.'
        }

        if (!curso.nivel || !Number.isInteger(nivel) || nivel < 1 || nivel > 12) {
            nuevosErrores.nivel = 'El nivel debe ser un número entero entre 1 y 12.'
        }

        setErrores(nuevosErrores)
        if (Object.keys(nuevosErrores).length > 0) return

        if (!esEdicion && (cargandoCarreras || errorCarreras)) {
            setErrores(actual => ({
                ...actual,
                carreraCode: errorCarreras || 'Espere a que se cargue la lista de carreras.'
            }))
            return
        }

        onGuardar({
            cursoCode: esEdicion ? inicial.cursoCode : codigoNormalizado,
            carreraCode: curso.carreraCode,
            nombre: nombreNormalizado,
            nivel
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
                    form="formularioCurso"
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
                        Información del Curso
                    </span>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioCurso" noValidate onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="cursoCodigo">
                                        <Form.Label>Código *</Form.Label>
                                        <Form.Control
                                            value={curso.cursoCode}
                                            readOnly={esEdicion}
                                            maxLength={15}
                                            isInvalid={!!errores.cursoCode}
                                            onChange={event => actualizarCampo(
                                                'cursoCode',
                                                event.target.value.toUpperCase()
                                            )}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errores.cursoCode}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="cursoCarrera">
                                        <Form.Label>Carrera *</Form.Label>
                                        {esEdicion ? (
                                            <Form.Control value={nombreCarrera} readOnly />
                                        ) : (
                                            <Form.Select
                                                value={curso.carreraCode}
                                                isInvalid={!!errores.carreraCode || !!errorCarreras}
                                                onChange={event => actualizarCampo(
                                                    'carreraCode',
                                                    event.target.value
                                                )}
                                                disabled={cargandoCarreras || !!errorCarreras}
                                                required
                                            >
                                                <option value="">
                                                    {cargandoCarreras
                                                        ? 'Cargando carreras...'
                                                        : 'Seleccione una carrera'}
                                                </option>
                                                {carreras.map(carrera => (
                                                    <option
                                                        key={carrera.carreraCode}
                                                        value={carrera.carreraCode}
                                                    >
                                                        {carrera.nombre}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        )}
                                        {!esEdicion && (
                                            <Form.Control.Feedback type="invalid">
                                                {errores.carreraCode || errorCarreras}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="cursoNivel">
                                        <Form.Label>Nivel *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={curso.nivel}
                                            min={1}
                                            max={12}
                                            step={1}
                                            isInvalid={!!errores.nivel}
                                            onChange={event => actualizarCampo(
                                                'nivel',
                                                event.target.value
                                            )}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errores.nivel}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Ingrese un número entero entre 1 y 12
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="cursoNombre">
                                        <Form.Label>Nombre *</Form.Label>
                                        <Form.Control
                                            value={curso.nombre}
                                            maxLength={150}
                                            isInvalid={!!errores.nombre}
                                            onChange={event => actualizarCampo(
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
                </Card.Body>
            </Card>
        </div>
    )
}

export default CursoForm
