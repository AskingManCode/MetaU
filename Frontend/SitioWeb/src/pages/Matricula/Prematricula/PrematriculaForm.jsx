import { useEffect, useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import periodoService from '../../../services/periodoService'
import carreraService from '../../../services/carreraService'
import cursoService from '../../../services/cursoService'
import expedienteService from '../../../services/expedienteService'

const estiloBoton = { width: '38px', height: '38px', backgroundColor: '#5d75e5', borderColor: '#5d75e5' }
const list = data => Array.isArray(data) ? data : data?.items ?? data?.data ?? []
const get = (item, ...keys) => keys.map(key => item?.[key]).find(value => value !== undefined && value !== null)

const emptyForm = {
    identificacion: '',
    carreraCode: '',
    cursos: [],
    periodoID: '',
    observaciones: ''
}

export default function PrematriculaForm({ initial, title, onSave, onCancel }) {
    const [catalog, setCatalog] = useState({ periods: [], careers: [], courses: [], students: [] })
    const [form, setForm] = useState(initial ?? emptyForm)
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true
        Promise.all([periodoService.getAll(), carreraService.getAll(), cursoService.getAll(), expedienteService.getAll()])
            .then(([periods, careers, courses, students]) => {
                if (activo) setCatalog({ periods: list(periods.data), careers: list(careers.data), courses: list(courses.data), students: list(students.data) })
            })
            .catch(error => {
                if (activo) setNotification({ type: 'error', message: error.response?.data?.mensaje ?? 'No se pudieron cargar los catálogos' })
            })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [])

    const futurePeriods = [...catalog.periods]
        .filter(item => new Date(get(item, 'fechaInicio', 'FechaInicio')) > new Date())
        .sort((first, second) => (
            Number(get(first, 'anio', 'Anio')) - Number(get(second, 'anio', 'Anio')) ||
            Number(get(first, 'numeroPeriodo', 'NumeroPeriodo')) - Number(get(second, 'numeroPeriodo', 'NumeroPeriodo'))
        ))
    const availableCourses = catalog.courses.filter(item => !form.carreraCode || get(item, 'carreraCode', 'CarreraCode') === form.carreraCode)
    const update = changes => setForm(current => ({ ...current, ...changes }))
    const submit = event => {
        event.preventDefault()
        onSave({ ...form, observaciones: form.observaciones || null })
    }

    return (
        <div>
            <Notification type={notification?.type} message={notification?.message} show={!!notification} onClose={() => setNotification(null)} />
            <PageHeader title={title} />

            <div className="d-flex gap-2 mb-3">
                <button type="button" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={estiloBoton} onClick={onCancel} disabled={loading} title="Volver al listado" aria-label="Volver al listado">
                    <i className="bi bi-arrow-left fs-5" />
                </button>
                <button type="submit" form="formularioPrematricula" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={estiloBoton} disabled={loading} title="Guardar" aria-label="Guardar">
                    {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-floppy fs-5" />}
                </button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom py-3"><span className="text-primary fw-semibold">Información de la Prematrícula</span></Card.Header>
                <Card.Body className="p-3">
                    <Form id="formularioPrematricula" onSubmit={submit}>
                        <fieldset disabled={loading} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="prematriculaEstudiante">
                                        <Form.Label>Estudiante *</Form.Label>
                                        <Form.Select required value={form.identificacion ?? ''} onChange={event => update({ identificacion: event.target.value })}>
                                            <option value="">Seleccione un estudiante</option>
                                            {catalog.students.map(item => {
                                                const id = get(item, 'identificacion', 'Identificacion')
                                                return <option key={id} value={id}>{get(item, 'nombreCompleto', 'NombreCompleto')} · {id}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="prematriculaCarrera">
                                        <Form.Label>Carrera *</Form.Label>
                                        <Form.Select required value={form.carreraCode ?? ''} onChange={event => update({ carreraCode: event.target.value, cursos: [] })}>
                                            <option value="">Seleccione una carrera</option>
                                            {catalog.careers.map(item => {
                                                const code = get(item, 'carreraCode', 'CarreraCode')
                                                return <option key={code} value={code}>{get(item, 'nombre', 'Nombre')}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="prematriculaCursos">
                                        <Form.Label>Cursos *</Form.Label>
                                        <Form.Select required multiple value={form.cursos ?? []} onChange={event => update({ cursos: [...event.target.selectedOptions].map(option => option.value) })}>
                                            {availableCourses.map(item => {
                                                const code = get(item, 'cursoCode', 'CursoCode')
                                                return <option key={code} value={code}>{get(item, 'nombre', 'Nombre')}</option>
                                            })}
                                        </Form.Select>
                                        <small>Use Ctrl/Cmd para seleccionar varios.</small>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="prematriculaPeriodo">
                                        <Form.Label>Periodo futuro *</Form.Label>
                                        <Form.Select required value={form.periodoID ?? ''} onChange={event => update({ periodoID: event.target.value })}>
                                            <option value="">Seleccione un periodo futuro</option>
                                            {futurePeriods.map(item => {
                                                const id = get(item, 'periodoID', 'PeriodoID')
                                                return <option key={id} value={id}>{get(item, 'anio', 'Anio')} - Periodo {get(item, 'numeroPeriodo', 'NumeroPeriodo')}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group controlId="prematriculaObservaciones" className="mt-3">
                                        <Form.Label>Observaciones</Form.Label>
                                        <Form.Control as="textarea" rows={3} value={form.observaciones ?? ''} onChange={event => update({ observaciones: event.target.value })} />
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
