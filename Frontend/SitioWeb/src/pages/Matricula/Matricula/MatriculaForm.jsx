import { useEffect, useState } from 'react'
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import periodoService from '../../../services/periodoService'
import cursoService from '../../../services/cursoService'
import grupoService from '../../../services/grupoService'
import expedienteService from '../../../services/expedienteService'

const estiloBoton = { width: '38px', height: '38px', backgroundColor: '#5d75e5', borderColor: '#5d75e5' }
const list = data => Array.isArray(data) ? data : data?.items ?? data?.data ?? []
const get = (item, ...keys) => keys.map(key => item?.[key]).find(value => value !== undefined && value !== null)

export default function MatriculaForm({ initial, title, onSave, onCancel }) {
    const [catalog, setCatalog] = useState({ periods: [], courses: [], groups: [], students: [] })
    const [form, setForm] = useState(initial ?? { identificacion: '', cursoCode: '', grupoCode: '', periodoID: '' })
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true
        Promise.all([periodoService.getAll(), cursoService.getAll(), grupoService.getAll(), expedienteService.getAll()])
            .then(([periods, courses, groups, students]) => {
                if (activo) setCatalog({ periods: list(periods.data), courses: list(courses.data), groups: list(groups.data), students: list(students.data) })
            })
            .catch(error => {
                if (activo) setNotification({ type: 'error', message: error.response?.data?.mensaje ?? 'No se pudieron cargar los catálogos' })
            })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [])

    const now = new Date()
    const activePeriods = catalog.periods.filter(item => (
        new Date(get(item, 'fechaInicio', 'FechaInicio')) <= now &&
        new Date(get(item, 'fechaFin', 'FechaFin')) >= now
    ))
    const availableGroups = catalog.groups
        .filter(item => !form.cursoCode || get(item, 'cursoCode', 'CursoCode') === form.cursoCode)
        .filter(item => !form.periodoID || get(item, 'periodoID', 'PeriodoID') === form.periodoID)
    const update = changes => setForm(current => ({ ...current, ...changes }))
    const submit = event => { event.preventDefault(); onSave(form) }

    return (
        <div>
            <Notification type={notification?.type} message={notification?.message} show={!!notification} onClose={() => setNotification(null)} />
            <PageHeader title={title} />

            <div className="d-flex gap-2 mb-3">
                <button type="button" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={estiloBoton} onClick={onCancel} disabled={loading} title="Volver al listado" aria-label="Volver al listado">
                    <i className="bi bi-arrow-left fs-5" />
                </button>
                <button type="submit" form="formularioMatricula" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={estiloBoton} disabled={loading} title="Guardar" aria-label="Guardar">
                    {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-floppy fs-5" />}
                </button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom py-3"><span className="text-primary fw-semibold">Información de la Matrícula</span></Card.Header>
                <Card.Body className="p-3">
                    <Form id="formularioMatricula" onSubmit={submit}>
                        <fieldset disabled={loading} className="border-0 p-0 m-0 w-100">
                            <Row className="g-3">
                                <Col md={6}><Form.Group controlId="matriculaEstudiante"><Form.Label>Estudiante *</Form.Label><Form.Select required disabled={Boolean(form.id)} value={form.identificacion ?? ''} onChange={event => update({ identificacion: event.target.value })}><option value="">Seleccione un estudiante</option>{catalog.students.map(item => { const id = get(item, 'identificacion', 'Identificacion'); return <option key={id} value={id}>{get(item, 'nombreCompleto', 'NombreCompleto')} · {id}</option> })}</Form.Select></Form.Group></Col>
                                <Col md={6}><Form.Group controlId="matriculaPeriodo"><Form.Label>Periodo activo *</Form.Label><Form.Select required disabled={Boolean(form.id)} value={form.periodoID ?? ''} onChange={event => update({ periodoID: event.target.value, grupoCode: '' })}><option value="">Seleccione un periodo activo</option>{activePeriods.map(item => { const id = get(item, 'periodoID', 'PeriodoID'); return <option key={id} value={id}>{get(item, 'anio', 'Anio')} - Periodo {get(item, 'numeroPeriodo', 'NumeroPeriodo')}</option> })}</Form.Select></Form.Group></Col>
                                <Col md={6}><Form.Group controlId="matriculaCurso"><Form.Label>Curso *</Form.Label><Form.Select required disabled={Boolean(form.id)} value={form.cursoCode ?? ''} onChange={event => update({ cursoCode: event.target.value, grupoCode: '' })}><option value="">Seleccione un curso</option>{catalog.courses.map(item => { const code = get(item, 'cursoCode', 'CursoCode'); return <option key={code} value={code}>{get(item, 'nombre', 'Nombre')}</option> })}</Form.Select></Form.Group></Col>
                                <Col md={6}><Form.Group controlId="matriculaGrupo"><Form.Label>Grupo *</Form.Label><Form.Select required value={form.grupoCode ?? ''} onChange={event => update({ grupoCode: event.target.value })}><option value="">Seleccione un grupo</option>{availableGroups.map(item => { const code = get(item, 'grupoCode', 'GrupoCode'); return <option key={code} value={code}>{code} · Cupo {get(item, 'cupo', 'Cupo')}</option> })}</Form.Select></Form.Group></Col>
                            </Row>
                        </fieldset>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}
