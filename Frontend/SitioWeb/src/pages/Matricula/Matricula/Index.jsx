import { useEffect, useMemo, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import matriculaService from '../../../services/matriculaService'
import periodoService from '../../../services/periodoService'
import cursoService from '../../../services/cursoService'
import grupoService from '../../../services/grupoService'
import expedienteService from '../../../services/expedienteService'

const list = data => Array.isArray(data) ? data : data?.items ?? data?.data ?? []
const get = (item, ...keys) => keys.map(key => item?.[key]).find(value => value !== undefined && value !== null)
const idOf = row => get(row, 'id', 'Id', 'matriculaXCursoID', 'MatriculaXCursoID')

export default function Matricula() {
    const navigate = useNavigate()
    const location = useLocation()
    const [catalog, setCatalog] = useState({ periods: [], courses: [], groups: [], students: [] })
    const [rows, setRows] = useState([])
    const [filters, setFilters] = useState({ course: '', group: '', student: '' })
    const [loading, setLoading] = useState(false)
    const [notice, setNotice] = useState(null)

    const loadCatalog = async () => {
        try {
            const [periods, courses, groups, students] = await Promise.all([
                periodoService.getAll(), cursoService.getAll(), grupoService.getAll(), expedienteService.getAll()
            ])
            setCatalog({
                periods: list(periods.data),
                courses: list(courses.data),
                groups: list(groups.data),
                students: list(students.data)
            })
        } catch (error) {
            setNotice({ type: 'error', message: error.response?.data?.mensaje ?? 'No se pudieron cargar los catálogos' })
        }
    }

    const loadRows = async () => {
        if (!filters.course || !filters.group) {
            setRows([])
            return
        }
        setLoading(true)
        try {
            const response = await matriculaService.getAll({ cursoCode: filters.course, grupoCode: filters.group })
            setRows(list(response.data))
        } catch (error) {
            setNotice({ type: 'error', message: error.response?.data?.mensaje ?? 'No se pudieron cargar las matrículas' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadCatalog() }, [])
    useEffect(() => { loadRows() }, [filters.course, filters.group])
    useEffect(() => {
        if (location.state?.mensaje) {
            setNotice({ type: 'success', message: location.state.mensaje })
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location, navigate])

    const courses = useMemo(() => Object.fromEntries(catalog.courses.map(item => [get(item, 'cursoCode', 'CursoCode'), item])), [catalog.courses])
    const groups = useMemo(() => Object.fromEntries(catalog.groups.map(item => [get(item, 'grupoCode', 'GrupoCode'), item])), [catalog.groups])
    const students = useMemo(() => Object.fromEntries(catalog.students.map(item => [get(item, 'identificacion', 'Identificacion'), item])), [catalog.students])
    const filteredRows = rows.filter(row => {
        if (!filters.student) return true
        const student = students[get(row, 'identificacion', 'Identificacion')]
        return `${get(student, 'nombreCompleto', 'NombreCompleto') ?? ''} ${get(row, 'identificacion', 'Identificacion') ?? ''}`
            .toLowerCase()
            .includes(filters.student.toLowerCase())
    })

    const confirmarEliminacion = row => {
        setNotice({
            type: 'warning',
            message: '¿Realmente desea eliminar la matrícula seleccionada?',
            onCancel: () => setNotice(null),
            onConfirm: async () => {
                setNotice(null)
                try {
                    await matriculaService.delete(idOf(row))
                    setNotice({ type: 'success', message: 'Matrícula eliminada correctamente' })
                    loadRows()
                } catch (error) {
                    setNotice({ type: 'error', message: error.response?.data?.mensaje ?? 'No se pudo eliminar la matrícula' })
                }
            }
        })
    }

    const columns = [
        {
            key: 'student',
            label: 'Estudiante',
            render: row => <><div>{get(students[get(row, 'identificacion', 'Identificacion')], 'nombreCompleto', 'NombreCompleto') ?? 'Estudiante no encontrado'}</div><small>{get(row, 'identificacion', 'Identificacion')}</small></>
        },
        { key: 'course', label: 'Curso', render: row => get(courses[get(row, 'cursoCode', 'CursoCode')], 'nombre', 'Nombre') ?? get(row, 'cursoCode', 'CursoCode') },
        { key: 'group', label: 'Grupo', render: row => get(groups[get(row, 'grupoCode', 'GrupoCode')], 'grupoCode', 'GrupoCode') ?? get(row, 'grupoCode', 'GrupoCode') },
        { key: 'period', label: 'Periodo', render: row => get(row, 'periodoID', 'PeriodoID') }
    ]

    return (
        <div>
            <Notification
                type={notice?.type}
                message={notice?.message}
                show={!!notice}
                onClose={() => setNotice(null)}
                onConfirm={notice?.onConfirm}
                onCancel={notice?.onCancel}
            />

            <MaintenanceHeader
                title="Mantenimiento de Matrículas"
                buttonLabel="Nueva Matrícula"
                onButtonClick={() => navigate('/matricula/nuevo', {
                    state: { initial: { cursoCode: filters.course, grupoCode: filters.group } }
                })}
            />

            <DataTable
                title="Información"
                columns={columns}
                data={filteredRows}
                loading={loading}
                pageSize={15}
                rowKey={idOf}
                filters={(
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Label>Curso</Form.Label>
                            <Form.Select value={filters.course} onChange={event => setFilters({ course: event.target.value, group: '', student: '' })}>
                                <option value="">Seleccione un curso</option>
                                {catalog.courses.map(item => { const code = get(item, 'cursoCode', 'CursoCode'); return <option key={code} value={code}>{get(item, 'nombre', 'Nombre')}</option> })}
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Label>Grupo</Form.Label>
                            <Form.Select value={filters.group} disabled={!filters.course} onChange={event => setFilters({ ...filters, group: event.target.value })}>
                                <option value="">Seleccione un grupo</option>
                                {catalog.groups.filter(item => !filters.course || get(item, 'cursoCode', 'CursoCode') === filters.course).map(item => { const code = get(item, 'grupoCode', 'GrupoCode'); return <option key={code} value={code}>{code} · Cupo {get(item, 'cupo', 'Cupo')}</option> })}
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Label>Estudiante</Form.Label>
                            <Form.Control placeholder="Nombre o identificación" value={filters.student} onChange={event => setFilters({ ...filters, student: event.target.value })} />
                        </Col>
                    </Row>
                )}
                actions={[
                    {
                        type: 'editar',
                        onClick: row => navigate(`/matricula/editar/${idOf(row)}`, {
                            state: {
                                matricula: {
                                    id: idOf(row),
                                    identificacion: get(row, 'identificacion', 'Identificacion'),
                                    cursoCode: get(row, 'cursoCode', 'CursoCode'),
                                    grupoCode: get(row, 'grupoCode', 'GrupoCode'),
                                    periodoID: get(row, 'periodoID', 'PeriodoID')
                                }
                            }
                        })
                    },
                    { type: 'eliminar', onClick: confirmarEliminacion }
                ]}
            />
        </div>
    )
}
