import { useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import prematriculaService from '../../../services/prematriculaService'
import periodoService from '../../../services/periodoService'
import carreraService from '../../../services/carreraService'
import cursoService from '../../../services/cursoService'
import expedienteService from '../../../services/expedienteService'

const list = data => Array.isArray(data) ? data : data?.items ?? data?.data ?? []
const get = (item, ...keys) => keys.map(key => item?.[key]).find(value => value !== undefined && value !== null)
const idOf = row => get(row, 'id', 'Id', 'preMatriculaID', 'PreMatriculaID')

export default function Prematricula() {
    const [rows, setRows] = useState([])
    const [catalog, setCatalog] = useState({ periods: [], careers: [], courses: [], students: [] })
    const [filters, setFilters] = useState({ period: '', career: '', course: '', student: '' })
    const [form, setForm] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState(null)

    const load = async () => {
        setLoading(true)
        try {
            const [pre, periods, careers, courses, students] = await Promise.all([
                prematriculaService.getAll(), periodoService.getAll(), carreraService.getAll(), cursoService.getAll(), expedienteService.getAll()
            ])
            setRows(list(pre.data))
            setCatalog({ periods: list(periods.data), careers: list(careers.data), courses: list(courses.data), students: list(students.data) })
        } catch (error) {
            setNotification({ type: 'danger', message: error.response?.data?.mensaje ?? 'No se pudo cargar la información' })
        } finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    const periods = useMemo(() => Object.fromEntries(catalog.periods.map(item => [get(item, 'periodoID', 'PeriodoID'), item])), [catalog.periods])
    const careers = useMemo(() => Object.fromEntries(catalog.careers.map(item => [get(item, 'carreraCode', 'CarreraCode'), item])), [catalog.careers])
    const courses = useMemo(() => Object.fromEntries(catalog.courses.map(item => [get(item, 'cursoCode', 'CursoCode'), item])), [catalog.courses])
    const students = useMemo(() => Object.fromEntries(catalog.students.map(item => [get(item, 'identificacion', 'Identificacion'), item])), [catalog.students])
    const futurePeriods = catalog.periods.filter(item => new Date(get(item, 'fechaInicio', 'FechaInicio')) > new Date())

    const visible = rows.filter(row => {
        const period = periods[get(row, 'periodoID', 'PeriodoID')]
        const career = careers[get(row, 'carreraCode', 'CarreraCode')]
        const student = students[get(row, 'identificacion', 'Identificacion')]
        const periodName = period ? `${get(period, 'anio', 'Anio')} - Periodo ${get(period, 'numeroPeriodo', 'NumeroPeriodo')}` : ''
        const careerName = get(career, 'nombre', 'Nombre') ?? get(row, 'carreraCode', 'CarreraCode')
        const studentName = `${get(student, 'nombreCompleto', 'NombreCompleto') ?? ''} ${get(row, 'identificacion', 'Identificacion') ?? ''}`.toLowerCase()
        const rowCourses = get(row, 'cursos', 'Cursos') ?? []
        return (!filters.period || filters.period === periodName) && (!filters.career || filters.career === careerName) && (!filters.course || rowCourses.includes(filters.course)) && (!filters.student || studentName.includes(filters.student.toLowerCase()))
    })

    const newForm = () => setForm({ id: null, identificacion: '', carreraCode: '', cursos: [], periodoID: '', observaciones: '' })
    const editForm = row => setForm({ id: idOf(row), identificacion: get(row, 'identificacion', 'Identificacion'), carreraCode: get(row, 'carreraCode', 'CarreraCode'), cursos: [...(get(row, 'cursos', 'Cursos') ?? [])], periodoID: get(row, 'periodoID', 'PeriodoID'), observaciones: get(row, 'observaciones', 'Observaciones') ?? '' })
    const save = async event => {
        event.preventDefault()
        try {
            const payload = { identificacion: form.identificacion, carreraCode: form.carreraCode, cursos: form.cursos, periodoID: form.periodoID, observaciones: form.observaciones || null }
            if (form.id) await prematriculaService.update(form.id, payload)
            else await prematriculaService.create(payload)
            setForm(null); setNotification({ type: 'success', message: form.id ? 'Prematrícula actualizada correctamente' : 'Prematrícula creada correctamente' }); load()
        } catch (error) { setNotification({ type: 'danger', message: error.response?.data?.mensaje ?? 'No se pudo guardar la prematrícula' }) }
    }
    const remove = async row => {
        if (!window.confirm('¿Realmente desea eliminar la prematrícula seleccionada?')) return
        try { await prematriculaService.delete(idOf(row)); setNotification({ type: 'success', message: 'Prematrícula eliminada correctamente' }); load() }
        catch (error) { setNotification({ type: 'danger', message: error.response?.data?.mensaje ?? 'No se pudo eliminar la prematrícula' }) }
    }

    const columns = [
        { key: 'estudiante', label: 'Estudiante', render: row => <><div>{get(students[get(row, 'identificacion', 'Identificacion')], 'nombreCompleto', 'NombreCompleto') ?? 'Estudiante no encontrado'}</div><small>{get(row, 'identificacion', 'Identificacion')}</small></> },
        { key: 'carrera', label: 'Carrera', render: row => get(careers[get(row, 'carreraCode', 'CarreraCode')], 'nombre', 'Nombre') ?? get(row, 'carreraCode', 'CarreraCode') },
        { key: 'cursos', label: 'Cursos', render: row => (get(row, 'cursos', 'Cursos') ?? []).map(code => get(courses[code], 'nombre', 'Nombre') ?? code).join(', ') },
        { key: 'periodo', label: 'Periodo', render: row => { const period = periods[get(row, 'periodoID', 'PeriodoID')]; return period ? `${get(period, 'anio', 'Anio')} - Periodo ${get(period, 'numeroPeriodo', 'NumeroPeriodo')}` : '-' } },
        { key: 'observaciones', label: 'Observaciones', render: row => get(row, 'observaciones', 'Observaciones') || '-' }
    ]

    return <div>
        <Notification type={notification?.type} message={notification?.message} show={!!notification} onClose={() => setNotification(null)} />
        <MaintenanceHeader title="Mantenimiento de Prematrículas" buttonLabel="Nueva Prematrícula" onButtonClick={newForm} />
        <DataTable title="Información" columns={columns} data={visible} loading={loading} pageSize={15} rowKey={idOf} filters={<Row className="g-3"><Col md={3}><Form.Label>Periodo<Form.Select value={filters.period} onChange={e => setFilters({ ...filters, period: e.target.value })}><option value="">Todos</option>{catalog.periods.map(item => { const text = `${get(item, 'anio', 'Anio')} - Periodo ${get(item, 'numeroPeriodo', 'NumeroPeriodo')}`; return <option key={get(item, 'periodoID', 'PeriodoID')} value={text}>{text}</option> })}</Form.Select></Form.Label></Col><Col md={3}><Form.Label>Carrera<Form.Select value={filters.career} onChange={e => setFilters({ ...filters, career: e.target.value })}><option value="">Todas</option>{catalog.careers.map(item => <option key={get(item, 'carreraCode', 'CarreraCode')} value={get(item, 'nombre', 'Nombre')}>{get(item, 'nombre', 'Nombre')}</option>)}</Form.Select></Form.Label></Col><Col md={3}><Form.Label>Curso<Form.Select value={filters.course} onChange={e => setFilters({ ...filters, course: e.target.value })}><option value="">Todos</option>{catalog.courses.map(item => <option key={get(item, 'cursoCode', 'CursoCode')} value={get(item, 'cursoCode', 'CursoCode')}>{get(item, 'nombre', 'Nombre')}</option>)}</Form.Select></Form.Label></Col><Col md={3}><Form.Label>Estudiante<Form.Control placeholder="Nombre o identificación" value={filters.student} onChange={e => setFilters({ ...filters, student: e.target.value })} /></Form.Label></Col></Row>} actions={[{ type: 'editar', onClick: editForm }, { type: 'eliminar', onClick: remove }]} />
        <Modal show={!!form} onHide={() => setForm(null)} centered size="lg"><Form onSubmit={save}><Modal.Header closeButton><Modal.Title>{form?.id ? 'Editar prematrícula' : 'Nueva prematrícula'}</Modal.Title></Modal.Header><Modal.Body><Row className="g-3"><Col md={6}><Form.Label>Estudiante<Form.Select required disabled={!!form?.id} value={form?.identificacion ?? ''} onChange={e => setForm({ ...form, identificacion: e.target.value })}><option value="">Seleccione un estudiante</option>{catalog.students.map(item => { const id = get(item, 'identificacion', 'Identificacion'); return <option key={id} value={id}>{get(item, 'nombreCompleto', 'NombreCompleto')} · {id}</option> })}</Form.Select></Form.Label></Col><Col md={6}><Form.Label>Carrera<Form.Select required value={form?.carreraCode ?? ''} onChange={e => setForm({ ...form, carreraCode: e.target.value, cursos: [] })}><option value="">Seleccione una carrera</option>{catalog.careers.map(item => <option key={get(item, 'carreraCode', 'CarreraCode')} value={get(item, 'carreraCode', 'CarreraCode')}>{get(item, 'nombre', 'Nombre')}</option>)}</Form.Select></Form.Label></Col><Col md={6}><Form.Label>Cursos<Form.Select required multiple value={form?.cursos ?? []} onChange={e => setForm({ ...form, cursos: [...e.target.selectedOptions].map(option => option.value) })}>{catalog.courses.filter(item => !form?.carreraCode || get(item, 'carreraCode', 'CarreraCode') === form.carreraCode).map(item => <option key={get(item, 'cursoCode', 'CursoCode')} value={get(item, 'cursoCode', 'CursoCode')}>{get(item, 'nombre', 'Nombre')}</option>)}</Form.Select><small>Use Ctrl/Cmd para seleccionar varios.</small></Form.Label></Col><Col md={6}><Form.Label>Periodo<Form.Select required value={form?.periodoID ?? ''} onChange={e => setForm({ ...form, periodoID: e.target.value })}><option value="">Seleccione un periodo futuro</option>{futurePeriods.map(item => <option key={get(item, 'periodoID', 'PeriodoID')} value={get(item, 'periodoID', 'PeriodoID')}>{get(item, 'anio', 'Anio')} - Periodo {get(item, 'numeroPeriodo', 'NumeroPeriodo')}</option>)}</Form.Select></Form.Label><Form.Label>Observaciones<Form.Control as="textarea" rows={3} value={form?.observaciones ?? ''} onChange={e => setForm({ ...form, observaciones: e.target.value })} /></Form.Label></Col></Row></Modal.Body><Modal.Footer><Button variant="secondary" onClick={() => setForm(null)}>Cancelar</Button><Button type="submit">Guardar</Button></Modal.Footer></Form></Modal>
    </div>
}
