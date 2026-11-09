import { useEffect, useMemo, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
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
    const navigate = useNavigate()
    const location = useLocation()
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
    const futurePeriods = [...catalog.periods]
        .filter(item => new Date(get(item, 'fechaInicio', 'FechaInicio')) > new Date())
        .sort((first, second) => (
            Number(get(first, 'anio', 'Anio')) - Number(get(second, 'anio', 'Anio')) ||
            Number(get(first, 'numeroPeriodo', 'NumeroPeriodo')) -
            Number(get(second, 'numeroPeriodo', 'NumeroPeriodo'))
        ))

    const visible = rows.filter(row => {
        const period = periods[get(row, 'periodoID', 'PeriodoID')]
        const career = careers[get(row, 'carreraCode', 'CarreraCode')]
        const student = students[get(row, 'identificacion', 'Identificacion')]
        const periodName = period ? `${get(period, 'anio', 'Anio')} - Periodo ${get(period, 'numeroPeriodo', 'NumeroPeriodo')}` : ''
        const careerName = get(career, 'nombre', 'Nombre') ?? get(row, 'carreraCode', 'CarreraCode')
        const studentName = `${get(student, 'nombreCompleto', 'NombreCompleto') ?? ''} ${get(row, 'identificacion', 'Identificacion') ?? ''}`.toLowerCase()
        const rowCourses = get(row, 'cursos', 'Cursos') ?? []
        return (
            (!filters.period || filters.period === periodName) &&
            (!filters.career || filters.career === careerName) &&
            (!filters.course || rowCourses.includes(filters.course)) &&
            (!filters.student || studentName.includes(filters.student.toLowerCase()))
        )
    })

    useEffect(() => {
        if (location.state?.mensaje) {
            setNotification({
                type: 'success',
                message: location.state.mensaje
            })
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location, navigate])
    const confirmarEliminacion = row => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar la prematrícula seleccionada?',
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                setNotification(null)

                try {
                    await prematriculaService.delete(idOf(row))
                    setNotification({
                        type: 'success',
                        message: 'Prematrícula eliminada correctamente'
                    })
                    load()
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: error.response?.data?.mensaje ??
                            'No se pudo eliminar la prematrícula'
                    })
                }
            }
        })
    }

    const columns = [
        {
            key: 'estudiante',
            label: 'Estudiante',
            render: row => <>
                <div>{get(students[get(row, 'identificacion', 'Identificacion')], 'nombreCompleto', 'NombreCompleto') ?? 'Estudiante no encontrado'}</div>
                <small>{get(row, 'identificacion', 'Identificacion')}</small>
            </>
        },
        {
            key: 'carrera',
            label: 'Carrera',
            render: row => get(careers[get(row, 'carreraCode', 'CarreraCode')], 'nombre', 'Nombre') ?? get(row, 'carreraCode', 'CarreraCode')
        },
        {
            key: 'cursos',
            label: 'Cursos',
            render: row => (get(row, 'cursos', 'Cursos') ?? [])
                .map(code => get(courses[code], 'nombre', 'Nombre') ?? code)
                .join(', ')
        },
        {
            key: 'periodo',
            label: 'Periodo',
            render: row => {
                const period = periods[get(row, 'periodoID', 'PeriodoID')]
                return period
                    ? `${get(period, 'anio', 'Anio')} - Periodo ${get(period, 'numeroPeriodo', 'NumeroPeriodo')}`
                    : '-'
            }
        },
        {
            key: 'observaciones',
            label: 'Observaciones',
            render: row => get(row, 'observaciones', 'Observaciones') || '-'
        }
    ]

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
                onConfirm={notification?.onConfirm}
                onCancel={notification?.onCancel}
            />

            <MaintenanceHeader
                title="Mantenimiento de Prematrículas"
                buttonLabel="Nueva Prematrícula"
                onButtonClick={() => navigate('/prematricula/nuevo')}
            />

            <DataTable
                title="Información"
                columns={columns}
                data={visible}
                loading={loading}
                pageSize={15}
                rowKey={idOf}
                filters={(
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Label>Periodo</Form.Label>
                            <Form.Select
                                value={filters.period}
                                onChange={e => setFilters({ ...filters, period: e.target.value })}
                            >
                                <option value="">Todos</option>
                                {futurePeriods.map(item => {
                                    const text = `${get(item, 'anio', 'Anio')} - Periodo ${get(item, 'numeroPeriodo', 'NumeroPeriodo')}`
                                    return <option key={get(item, 'periodoID', 'PeriodoID')} value={text}>{text}</option>
                                })}
                            </Form.Select>
                        </Col>

                        <Col md={3}>
                            <Form.Label>Carrera</Form.Label>
                            <Form.Select value={filters.career} onChange={e => setFilters({ ...filters, career: e.target.value })}>
                                <option value="">Todas</option>
                                {catalog.careers.map(item => {
                                    const code = get(item, 'carreraCode', 'CarreraCode')
                                    const name = get(item, 'nombre', 'Nombre')

                                    return (
                                        <option key={code} value={name}>
                                            {name}
                                        </option>
                                    )
                                })}
                            </Form.Select>
                        </Col>

                        <Col md={3}>
                            <Form.Label>Curso</Form.Label>
                            <Form.Select value={filters.course} onChange={e => setFilters({ ...filters, course: e.target.value })}>
                                <option value="">Todos</option>
                                {catalog.courses.map(item => {
                                    const code = get(item, 'cursoCode', 'CursoCode')

                                    return (
                                        <option key={code} value={code}>
                                            {get(item, 'nombre', 'Nombre')}
                                        </option>
                                    )
                                })}
                            </Form.Select>
                        </Col>

                        <Col md={3}>
                            <Form.Label>Estudiante</Form.Label>
                            <Form.Control placeholder="Nombre o identificación" value={filters.student} onChange={e => setFilters({ ...filters, student: e.target.value })} />
                        </Col>
                    </Row>
                )}
                actions={[{ type: 'editar', onClick: row => navigate(`/prematricula/editar/${idOf(row)}`) }, { type: 'eliminar', onClick: confirmarEliminacion }]}
            />
        </div>
    )
}
