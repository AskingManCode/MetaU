
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'

export default function PeriodoForm({ titulo, datos, onChange, onSubmit, onCancelar, guardando }) {
    return (
        <Form onSubmit={onSubmit}>
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body d-flex gap-2" style={{ borderLeft: '3px solid #526cdb' }}>
                    <Button type="button" className="rounded-circle border-0 p-0" style={{ width: 40, height: 40, backgroundColor: '#526cdb' }} title="Volver" aria-label="Volver al listado" onClick={onCancelar} disabled={guardando}><i className="bi bi-arrow-left" /></Button>
                    <Button type="submit" className="rounded-circle border-0 p-0" style={{ width: 40, height: 40, backgroundColor: '#526cdb' }} title="Guardar" aria-label="Guardar periodo" disabled={guardando}>{guardando ? <Spinner size="sm" /> : <i className="bi bi-floppy" />}</Button>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light text-primary fw-semibold py-3">{titulo}</Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group controlId="periodoAnio">
                                <Form.Label>Anio *</Form.Label>
                                <Form.Control type="number" min="1" max="32767" step="1" required value={datos.anio} onChange={e => onChange('anio', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="periodoNumero">
                                <Form.Label>Numero de periodo *</Form.Label>
                                <Form.Control type="number" min="1" step="1" required value={datos.numeroPeriodo} onChange={e => onChange('numeroPeriodo', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="periodoInicio">
                                <Form.Label>Fecha de inicio *</Form.Label>
                                <Form.Control type="date" required value={datos.fechaInicio} onChange={e => onChange('fechaInicio', e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="periodoFin">
                                <Form.Label>Fecha de fin *</Form.Label>
                                <Form.Control type="date" min={datos.fechaInicio || undefined} required value={datos.fechaFin} onChange={e => onChange('fechaFin', e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Form>
    )
}
