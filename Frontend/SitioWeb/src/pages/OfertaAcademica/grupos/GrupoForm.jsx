
import { useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import useCatalogosGrupo from '../../../hooks/useCatalogosGrupo'
import { prepararGrupoRequest } from '../../../utils/grupoUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function GrupoForm({ titulo, inicial, onGuardar, onCancelar, guardando, esEdicion = false }) {
    const { cursos, profesores, periodos, loading, error } = useCatalogosGrupo()

    const [datos, setDatos] = useState({
        grupoCode: inicial?.grupoCode ?? '',
        numeroGrupo: String(inicial?.numeroGrupo ?? ''),
        cursoCode: inicial?.cursoCode ?? '',
        profesorID: inicial?.profesorID ?? '',
        horario: inicial?.horario ?? '',
        cupo: String(inicial?.cupo ?? ''),
        periodoID: inicial?.periodoID ?? ''
    })

    const cambiarCampo = (campo, valor) => {
        setDatos(actual => ({ ...actual, [campo]: valor }))
    }

    const manejarSubmit = e => {
        e.preventDefault()
        onGuardar(prepararGrupoRequest(datos))
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
                    form="formularioGrupo"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    disabled={guardando || loading || !!error}
                    title="Guardar"
                    aria-label="Guardar"
                >
                    {guardando ? <Spinner animation="border" size="sm" /> : <i className="bi bi-floppy fs-5" />}
                </button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom py-3">
                    <span className="text-primary fw-semibold">Informacion del Grupo</span>
                </Card.Header>

                <Card.Body className="p-3">
                    {error && (
                        <div className="alert alert-warning">
                            {error}. La seleccion estara disponible cuando los servicios respondan correctamente.
                        </div>
                    )}

                    <Form id="formularioGrupo" onSubmit={manejarSubmit}>
                        <fieldset disabled={guardando} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="grupoCodigo">
                                        <Form.Label>Codigo del grupo *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingrese el codigo del grupo"
                                            value={datos.grupoCode}
                                            readOnly={esEdicion}
                                            onChange={e => cambiarCampo('grupoCode', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="grupoNumero">
                                        <Form.Label>Numero de grupo *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            max="255"
                                            step="1"
                                            placeholder="Ingrese el numero de grupo"
                                            value={datos.numeroGrupo}
                                            onChange={e => cambiarCampo('numeroGrupo', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="grupoCurso">
                                        <Form.Label>Curso *</Form.Label>
                                        <Form.Select
                                            value={datos.cursoCode}
                                            onChange={e => cambiarCampo('cursoCode', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccione un curso</option>

                                            {datos.cursoCode && !cursos.some(c => c.cursoCode === datos.cursoCode) && (
                                                <option value={datos.cursoCode}>{datos.cursoCode}</option>
                                            )}

                                            {cursos.map(c => (
                                                <option key={c.cursoCode} value={c.cursoCode}>
                                                    {c.nombre ? `${c.cursoCode} - ${c.nombre}` : c.cursoCode}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="grupoProfesor">
                                        <Form.Label>Profesor *</Form.Label>
                                        <Form.Select
                                            value={datos.profesorID}
                                            onChange={e => cambiarCampo('profesorID', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccione un profesor</option>

                                            {datos.profesorID && !profesores.some(p => p.profesorID === datos.profesorID) && (
                                                <option value={datos.profesorID}>{datos.profesorID}</option>
                                            )}

                                            {profesores.map(p => (
                                                <option key={p.profesorID} value={p.profesorID}>
                                                    {p.nombreCompleto || p.profesorID}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="grupoPeriodo">
                                        <Form.Label>Periodo *</Form.Label>
                                        <Form.Select
                                            value={datos.periodoID}
                                            onChange={e => cambiarCampo('periodoID', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccione un periodo</option>

                                            {datos.periodoID && !periodos.some(p => p.periodoID === datos.periodoID) && (
                                                <option value={datos.periodoID}>{datos.periodoID}</option>
                                            )}

                                            {periodos.map(p => (
                                                <option key={p.periodoID} value={p.periodoID}>
                                                    {p.anio} - Periodo {p.numeroPeriodo}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="grupoCupo">
                                        <Form.Label>Cupo *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            max="2147483647"
                                            step="1"
                                            placeholder="Ingrese el cupo"
                                            value={datos.cupo}
                                            onChange={e => cambiarCampo('cupo', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12}>
                                    <Form.Group controlId="grupoHorario">
                                        <Form.Label>Horario *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ejemplo: Lunes 08:00-10:00"
                                            value={datos.horario}
                                            onChange={e => cambiarCampo('horario', e.target.value)}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Ingrese el dia y el rango de horas del grupo
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                {esEdicion && (
                                    <Col md={6}>
                                        <Form.Group controlId="grupoEstado">
                                            <Form.Label>Estado actual</Form.Label>
                                            <Form.Control
                                                value={inicial?.estado ? 'Activo' : 'Inactivo'}
                                                readOnly
                                            />
                                        </Form.Group>
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

export default GrupoForm
