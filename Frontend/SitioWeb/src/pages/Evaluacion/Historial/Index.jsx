import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import DataTable from '../../../components/DataTable'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import historialAcademicoService from '../../../services/historialAcademicoService'

const list = data => {
    if (Array.isArray(data)) {
        return data
    }

    return data?.items ?? data?.data ?? []
}

const getErrorMessage = error => {
    const response = error?.response?.data

    return response?.mensaje
        ?? response?.title
        ?? response?.detail
        ?? 'No se pudo cargar el historial académico'
}

export default function HistorialAcademico() {
    const [tipoIdentificacion, setTipoIdentificacion] = useState('CED')
    const [identificacion, setIdentificacion] = useState('')
    const [rows, setRows] = useState([])
    const [notification, setNotification] = useState(null)
    const [loading, setLoading] = useState(false)

    const consultar = async event => {
        event.preventDefault()

        const identificacionLimpia = identificacion.trim()

        if (!identificacionLimpia) {
            setNotification({
                type: 'warning',
                message: 'Digite una identificación para consultar',
            })
            setRows([])
            return
        }

        setLoading(true)
        setRows([])
        setNotification(null)

        try {
            const response = await historialAcademicoService.consultar(
                tipoIdentificacion,
                identificacionLimpia,
            )

            setRows(list(response))
        } catch (error) {
            setRows([])
            setNotification({
                type: 'error',
                message: getErrorMessage(error),
            })
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: 'curso',
            label: 'Curso',
            render: row => row.nombreCurso ?? row.codigoCurso ?? '-',
        },
        {
            key: 'anio',
            label: 'Año',
            render: row => row.anio ?? '-',
        },
        {
            key: 'periodo',
            label: 'Periodo',
            render: row => row.numeroPeriodo ?? '-',
        },
        {
            key: 'promedio',
            label: 'Promedio',
            render: row => row.promedio ?? '-',
        },
    ]

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={Boolean(notification)}
                onClose={() => setNotification(null)}
            />

            <PageHeader title="Historial académico" />

            <DataTable
                title="Información"
                columns={columns}
                data={rows}
                loading={loading}
                rowKey={row => (
                    row.id
                    ?? `${row.codigoCurso ?? 'curso'}-${row.anio ?? 'anio'}-${row.numeroPeriodo ?? 'periodo'}`
                )}
                filters={(
                    <Form onSubmit={consultar}>
                        <Row className="g-3 align-items-end">
                            <Col md={4} lg={3}>
                                <Form.Group controlId="tipoIdentificacion">
                                    <Form.Label>Tipo de identificación</Form.Label>
                                    <Form.Select
                                        value={tipoIdentificacion}
                                        onChange={event => setTipoIdentificacion(event.target.value)}
                                    >
                                        <option value="CED">Cédula</option>
                                        <option value="EXT">Extranjero</option>
                                        <option value="PAS">Pasaporte</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={5} lg={5}>
                                <Form.Group controlId="identificacion">
                                    <Form.Label>Identificación</Form.Label>
                                    <Form.Control
                                        required
                                        value={identificacion}
                                        onChange={event => setIdentificacion(event.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3} lg={4}>
                                <Button type="submit" disabled={loading}>
                                    <i className="bi bi-search me-2" />
                                    {loading ? 'Consultando...' : 'Consultar historial'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                )}
            />
        </div>
    )
}
