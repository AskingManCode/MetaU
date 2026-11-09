import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import periodoService from '../../../services/periodoService'
import cursoService from '../../../services/cursoService'
import grupoService from '../../../services/grupoService'
import expedienteService from '../../../services/expedienteService'

const list = data => Array.isArray(data) ? data : data?.items ?? data?.data ?? []
const get = (item, ...keys) => keys.map(key => item?.[key]).find(value => value !== undefined && value !== null)

export default function MatriculaForm({ initial, title, onSave, onCancel }) {
    const [catalog, setCatalog] = useState({ periods: [], courses: [], groups: [], students: [] })
    const [form, setForm] = useState(initial ?? { identificacion: '', cursoCode: '', grupoCode: '', periodoID: '' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            periodoService.getAll(),
            cursoService.getAll(),
            grupoService.getAll(),
            expedienteService.getAll()
        ])
            .then(([periods, courses, groups, students]) => setCatalog({
                periods: list(periods.data),
                courses: list(courses.data),
                groups: list(groups.data),
                students: list(students.data)
            }))
            .finally(() => setLoading(false))
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

    const submit = event => {
        event.preventDefault()
        onSave(form)
    }

    return (
        <Modal show onHide={onCancel} centered>
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {loading ? <p>Cargando información...</p> : (
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Label>Estudiante</Form.Label>
                                <Form.Select
                                    required
                                    disabled={Boolean(form.id)}
                                    value={form.identificacion ?? ''}
                                    onChange={event => update({ identificacion: event.target.value })}
                                >
                                    <option value="">Seleccione un estudiante</option>
                                    {catalog.students.map(item => {
                                        const id = get(item, 'identificacion', 'Identificacion')
                                        return <option key={id} value={id}>{get(item, 'nombreCompleto', 'NombreCompleto')} · {id}</option>
                                    })}
                                </Form.Select>
                            </Col>

                            <Col md={12}>
                                <Form.Label>Periodo activo</Form.Label>
                                <Form.Select
                                    required
                                    disabled={Boolean(form.id)}
                                    value={form.periodoID ?? ''}
                                    onChange={event => update({ periodoID: event.target.value, grupoCode: '' })}
                                >
                                    <option value="">Seleccione un periodo activo</option>
                                    {activePeriods.map(item => {
                                        const id = get(item, 'periodoID', 'PeriodoID')
                                        return <option key={id} value={id}>{get(item, 'anio', 'Anio')} - Periodo {get(item, 'numeroPeriodo', 'NumeroPeriodo')}</option>
                                    })}
                                </Form.Select>
                            </Col>

                            <Col md={12}>
                                <Form.Label>Curso</Form.Label>
                                <Form.Select
                                    required
                                    disabled={Boolean(form.id)}
                                    value={form.cursoCode ?? ''}
                                    onChange={event => update({ cursoCode: event.target.value, grupoCode: '' })}
                                >
                                    <option value="">Seleccione un curso</option>
                                    {catalog.courses.map(item => {
                                        const code = get(item, 'cursoCode', 'CursoCode')
                                        return <option key={code} value={code}>{get(item, 'nombre', 'Nombre')}</option>
                                    })}
                                </Form.Select>
                            </Col>

                            <Col md={12}>
                                <Form.Label>Grupo</Form.Label>
                                <Form.Select
                                    required
                                    value={form.grupoCode ?? ''}
                                    onChange={event => update({ grupoCode: event.target.value })}
                                >
                                    <option value="">Seleccione un grupo</option>
                                    {availableGroups.map(item => {
                                        const code = get(item, 'grupoCode', 'GrupoCode')
                                        return <option key={code} value={code}>{code} · Cupo {get(item, 'cupo', 'Cupo')}</option>
                                    })}
                                </Form.Select>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>Confirmar matrícula</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
