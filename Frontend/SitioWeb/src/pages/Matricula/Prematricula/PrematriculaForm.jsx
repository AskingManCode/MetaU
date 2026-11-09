import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import periodoService from '../../../services/periodoService'
import carreraService from '../../../services/carreraService'
import cursoService from '../../../services/cursoService'
import expedienteService from '../../../services/expedienteService'

const list = data => (
    Array.isArray(data) ? data : data?.items ?? data?.data ?? []
)

const get = (item, ...keys) => (
    keys
        .map(key => item?.[key])
        .find(value => value !== undefined && value !== null)
)

const emptyForm = {
    identificacion: '',
    carreraCode: '',
    cursos: [],
    periodoID: '',
    observaciones: ''
}

export default function PrematriculaForm({ initial, title, onSave, onCancel }) {
    const [catalog, setCatalog] = useState({
        periods: [],
        careers: [],
        courses: [],
        students: []
    })
    const [form, setForm] = useState(initial ?? emptyForm)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            periodoService.getAll(),
            carreraService.getAll(),
            cursoService.getAll(),
            expedienteService.getAll()
        ])
            .then(([periods, careers, courses, students]) => {
                setCatalog({
                    periods: list(periods.data),
                    careers: list(careers.data),
                    courses: list(courses.data),
                    students: list(students.data)
                })
            })
            .finally(() => setLoading(false))
    }, [])

    const futurePeriods = catalog.periods.filter(item => (
        new Date(get(item, 'fechaInicio', 'FechaInicio')) > new Date()
    ))

    const update = changes => {
        setForm(current => ({ ...current, ...changes }))
    }

    const submit = event => {
        event.preventDefault()
        onSave({ ...form, observaciones: form.observaciones || null })
    }

    return (
        <Modal show onHide={onCancel} centered size="lg">
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {loading ? (
                        <p>Cargando información...</p>
                    ) : (
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label>Estudiante</Form.Label>
                                <Form.Select
                                    required
                                    disabled={Boolean(form.id)}
                                    value={form.identificacion ?? ''}
                                    onChange={event => update({
                                        identificacion: event.target.value
                                    })}
                                >
                                    <option value="">
                                        Seleccione un estudiante
                                    </option>
                                    {catalog.students.map(item => {
                                        const id = get(
                                            item,
                                            'identificacion',
                                            'Identificacion'
                                        )

                                        return (
                                            <option key={id} value={id}>
                                                {get(
                                                    item,
                                                    'nombreCompleto',
                                                    'NombreCompleto'
                                                )} · {id}
                                            </option>
                                        )
                                    })}
                                </Form.Select>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Carrera</Form.Label>
                                <Form.Select
                                    required
                                    value={form.carreraCode ?? ''}
                                    onChange={event => update({
                                        carreraCode: event.target.value,
                                        cursos: []
                                    })}
                                >
                                    <option value="">
                                        Seleccione una carrera
                                    </option>
                                    {catalog.careers.map(item => {
                                        const code = get(
                                            item,
                                            'carreraCode',
                                            'CarreraCode'
                                        )

                                        return (
                                            <option key={code} value={code}>
                                                {get(item, 'nombre', 'Nombre')}
                                            </option>
                                        )
                                    })}
                                </Form.Select>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Cursos</Form.Label>
                                <Form.Select
                                    required
                                    multiple
                                    value={form.cursos ?? []}
                                    onChange={event => update({
                                        cursos: [...event.target.selectedOptions]
                                            .map(option => option.value)
                                    })}
                                >
                                    {catalog.courses
                                        .filter(item => (
                                            !form.carreraCode ||
                                            get(
                                                item,
                                                'carreraCode',
                                                'CarreraCode'
                                            ) === form.carreraCode
                                        ))
                                        .map(item => {
                                            const code = get(
                                                item,
                                                'cursoCode',
                                                'CursoCode'
                                            )

                                            return (
                                                <option key={code} value={code}>
                                                    {get(item, 'nombre', 'Nombre')}
                                                </option>
                                            )
                                        })}
                                </Form.Select>
                                <small>Use Ctrl/Cmd para seleccionar varios.</small>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Periodo</Form.Label>
                                <Form.Select
                                    required
                                    value={form.periodoID ?? ''}
                                    onChange={event => update({
                                        periodoID: event.target.value
                                    })}
                                >
                                    <option value="">
                                        Seleccione un periodo futuro
                                    </option>
                                    {futurePeriods.map(item => {
                                        const id = get(
                                            item,
                                            'periodoID',
                                            'PeriodoID'
                                        )

                                        return (
                                            <option key={id} value={id}>
                                                {get(item, 'anio', 'Anio')} - Periodo {get(
                                                    item,
                                                    'numeroPeriodo',
                                                    'NumeroPeriodo'
                                                )}
                                            </option>
                                        )
                                    })}
                                </Form.Select>

                                <Form.Label className="mt-3">
                                    Observaciones
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={form.observaciones ?? ''}
                                    onChange={event => update({
                                        observaciones: event.target.value
                                    })}
                                />
                            </Col>
                        </Row>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
