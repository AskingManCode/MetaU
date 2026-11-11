import { useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import matriculaService from '../../../services/matriculaService'
import periodoService from '../../../services/periodoService'
import cursoService from '../../../services/cursoService'
import grupoService from '../../../services/grupoService'
import expedienteService from '../../../services/expedienteService'
import { descargarArchivo, generarCsv, registrarBitacora } from '../../../utils/listaEstudiantesUtils'

const list = data => Array.isArray(data) ? data : data?.items ?? data?.data ?? []
const get = (item, ...keys) => keys.map(key => item?.[key]).find(value => value !== undefined && value !== null)
const idOf = row => get(row, 'id', 'Id', 'matriculaXCursoID', 'MatriculaXCursoID')

export default function Matricula() {
    const navigate = useNavigate()
    const location = useLocation()
    const [catalog, setCatalog] = useState({ periods: [], courses: [], groups: [], students: [] })
    const [rows, setRows] = useState([])
    const [filters, setFilters] = useState({ period: '', course: '', group: '', student: '' })
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
            const estudiantes = list(response.data)
            const identificaciones = estudiantes
                .map(row => get(row, 'identificacion', 'Identificacion'))
                .filter(Boolean)

            const respuestas = await Promise.all(
                identificaciones.map(identificacion => matriculaService.getAll({ identificacion }))
            )
            const matriculas = respuestas.flatMap(respuesta => list(respuesta.data))

            setRows(matriculas.filter(row => (
                get(row, 'cursoCode', 'CursoCode') === filters.course &&
                get(row, 'grupoCode', 'GrupoCode') === filters.group &&
                (!filters.period || get(row, 'periodoID', 'PeriodoID') === filters.period)
            )))
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

    const activePeriods = useMemo(() => catalog.periods
        .filter(item => (
            new Date(get(item, 'fechaInicio', 'FechaInicio')) <= new Date() &&
            new Date(get(item, 'fechaFin', 'FechaFin')) >= new Date()
        ))
        .sort((first, second) => (
            Number(get(first, 'anio', 'Anio')) - Number(get(second, 'anio', 'Anio')) ||
            Number(get(first, 'numeroPeriodo', 'NumeroPeriodo')) - Number(get(second, 'numeroPeriodo', 'NumeroPeriodo'))
        )), [catalog.periods])
    const courses = useMemo(() => Object.fromEntries(catalog.courses.map(item => [get(item, 'cursoCode', 'CursoCode'), item])), [catalog.courses])
    const groups = useMemo(() => Object.fromEntries(catalog.groups.map(item => [get(item, 'grupoCode', 'GrupoCode'), item])), [catalog.groups])
    const students = useMemo(() => Object.fromEntries(catalog.students.map(item => [get(item, 'identificacion', 'Identificacion'), item])), [catalog.students])
    const periods = useMemo(() => Object.fromEntries(catalog.periods.map(item => [get(item, 'periodoID', 'PeriodoID'), item])), [catalog.periods])
    const filteredRows = rows.filter(row => {
        if (!filters.student) return true
        const student = students[get(row, 'identificacion', 'Identificacion')]
        return `${get(student, 'nombreCompleto', 'NombreCompleto') ?? ''} ${get(row, 'identificacion', 'Identificacion') ?? ''}`
            .toLowerCase()
            .includes(filters.student.toLowerCase())
    })

    const exportarCsv = () => {
        if (!filteredRows.length) {
            setNotice({ type: 'info', message: 'No hay matrículas para exportar' })
            return
        }

        const exportColumns = [
            { key: 'identificacion', label: 'Identificación' },
            { key: 'estudiante', label: 'Estudiante' },
            { key: 'curso', label: 'Curso' },
            { key: 'grupo', label: 'Grupo' },
            { key: 'periodo', label: 'Periodo' },
        ]
        const exportRows = filteredRows.map(row => {
            const identificacion = get(row, 'identificacion', 'Identificacion') ?? ''
            const periodoId = get(row, 'periodoID', 'PeriodoID') ?? filters.period
            const period = periods[periodoId]

            return {
                identificacion,
                estudiante: get(students[identificacion], 'nombreCompleto', 'NombreCompleto') ?? 'Estudiante no encontrado',
                curso: get(courses[get(row, 'cursoCode', 'CursoCode')], 'nombre', 'Nombre') ?? get(row, 'cursoCode', 'CursoCode') ?? '',
                grupo: get(row, 'grupoCode', 'GrupoCode') ?? filters.group ?? '',
                periodo: period
                    ? `${get(period, 'anio', 'Anio')} - Periodo ${get(period, 'numeroPeriodo', 'NumeroPeriodo')}`
                    : periodoId ?? '',
            }
        })

        descargarArchivo(
            generarCsv(exportColumns, exportRows),
            'matriculas.csv',
            'text/csv;charset=utf-8',
        )
        registrarBitacora('El usuario exporta a CSV el listado de matrículas')
    }

    const limpiarFiltros = () => {
        setFilters({ period: '', course: '', group: '', student: '' })
    }

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
            sortable: true,
            sortValue: row => `${get(students[get(row, 'identificacion', 'Identificacion')], 'nombreCompleto', 'NombreCompleto') ?? ''} ${get(row, 'identificacion', 'Identificacion') ?? ''}`,
            render: row => <><div>{get(students[get(row, 'identificacion', 'Identificacion')], 'nombreCompleto', 'NombreCompleto') ?? 'Estudiante no encontrado'}</div><small>{get(row, 'identificacion', 'Identificacion')}</small></>
        },
        { key: 'course', label: 'Curso', sortable: true, sortValue: () => get(courses[filters.course], 'nombre', 'Nombre') ?? filters.course, render: row => get(courses[get(row, 'cursoCode', 'CursoCode')], 'nombre', 'Nombre') ?? get(courses[filters.course], 'nombre', 'Nombre') ?? get(row, 'cursoCode', 'CursoCode') ?? filters.course },
        { key: 'group', label: 'Grupo', sortable: true, sortValue: () => filters.group, render: row => get(groups[get(row, 'grupoCode', 'GrupoCode')], 'grupoCode', 'GrupoCode') ?? get(groups[filters.group], 'grupoCode', 'GrupoCode') ?? get(row, 'grupoCode', 'GrupoCode') ?? filters.group },
        { key: 'period', label: 'Periodo', sortable: true, sortValue: () => filters.period, render: row => { const periodId = get(row, 'periodoID', 'PeriodoID') ?? filters.period; const period = periods[periodId]; return period ? `${get(period, 'anio', 'Anio')} - Periodo ${get(period, 'numeroPeriodo', 'NumeroPeriodo')}` : periodId } }
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
                    <Row className="g-3 align-items-end">
                        <Col md={3}>
                            <Form.Label>Periodo</Form.Label>
                            <Form.Select value={filters.period} onChange={event => setFilters({ ...filters, period: event.target.value, group: '' })}>
                                <option value="">Todos</option>
                                {activePeriods.map(item => { const id = get(item, 'periodoID', 'PeriodoID'); return <option key={id} value={id}>{get(item, 'anio', 'Anio')} - Periodo {get(item, 'numeroPeriodo', 'NumeroPeriodo')}</option> })}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Curso</Form.Label>
                            <Form.Select value={filters.course} onChange={event => setFilters({ ...filters, course: event.target.value, group: '', student: '' })}>
                                <option value="">Seleccione un curso</option>
                                {catalog.courses.map(item => { const code = get(item, 'cursoCode', 'CursoCode'); return <option key={code} value={code}>{get(item, 'nombre', 'Nombre')}</option> })}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Grupo</Form.Label>
                            <Form.Select value={filters.group} disabled={!filters.course} onChange={event => setFilters({ ...filters, group: event.target.value })}>
                                <option value="">Seleccione un grupo</option>
                                {catalog.groups
                                    .filter(item => !filters.course || get(item, 'cursoCode', 'CursoCode') === filters.course)
                                    .filter(item => !filters.period || get(item, 'periodoID', 'PeriodoID') === filters.period)
                                    .map(item => { const code = get(item, 'grupoCode', 'GrupoCode'); return <option key={code} value={code}>{code} · Cupo {get(item, 'cupo', 'Cupo')}</option> })}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Estudiante</Form.Label>
                            <Form.Control placeholder="Nombre o identificación" value={filters.student} onChange={event => setFilters({ ...filters, student: event.target.value })} />
                        </Col>
                        <Col md={3}>
                            <Button type="button" variant="outline-secondary" className="w-100" onClick={limpiarFiltros}>
                                <i className="bi bi-arrow-counterclockwise me-2" />
                                Limpiar filtros
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button type="button" variant="outline-primary" className="w-100" onClick={exportarCsv} disabled={!filteredRows.length || loading}>
                                <i className="bi bi-filetype-csv me-2" />
                                Exportar CSV
                            </Button>
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
