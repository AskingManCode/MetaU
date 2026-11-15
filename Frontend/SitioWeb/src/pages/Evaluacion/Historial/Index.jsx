import { useMemo, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import DataTable from '../../../components/DataTable'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import historialAcademicoService from '../../../services/historialAcademicoService'
import { abrirVistaPdf, descargarArchivo, generarCsv, registrarBitacora } from '../../../utils/listaEstudiantesUtils'

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

const valoresUnicosHistorial = (lista, campo) =>
    [...new Set(lista.map(row => row[campo]).filter(value => value !== null && value !== undefined))]
        .sort((a, b) => String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' }))

export default function HistorialAcademico() {
    const [tipoIdentificacion, setTipoIdentificacion] = useState('CED')
    const [identificacion, setIdentificacion] = useState('')
    const [rows, setRows] = useState([])
    const [notification, setNotification] = useState(null)
    const [loading, setLoading] = useState(false)
    const [anio, setAnio] = useState('')
    const [periodo, setPeriodo] = useState('')

    const columns = [
        { key: 'codigoCurso', label: 'Código del curso', sortable: true },
        { key: 'nombreCurso', label: 'Curso', sortable: true },
        { key: 'promedio', label: 'Promedio', sortable: true },
        { key: 'anio', label: 'Año', sortable: true },
        { key: 'numeroPeriodo', label: 'Periodo', sortable: true },
    ]

    const anios = useMemo(() => valoresUnicosHistorial(rows, 'anio'), [rows])
    const periodos = useMemo(() => valoresUnicosHistorial(rows.filter(row => !anio || String(row.anio) === String(anio)), 'numeroPeriodo'), [rows, anio])
    const filteredRows = useMemo(() => rows.filter(row =>
        (!anio || String(row.anio) === String(anio)) &&
        (!periodo || String(row.numeroPeriodo) === String(periodo))), [rows, anio, periodo])

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
            setAnio('')
            setPeriodo('')
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

    const exportar = formato => {
        if (!filteredRows.length) {
            setNotification({ type: 'info', message: 'No hay registros para exportar' })
            return
        }
        const titulo = `Historial académico - ${identificacion.trim()}`
        if (formato === 'csv') {
            descargarArchivo(generarCsv(columns, filteredRows), `historial-academico-${identificacion.trim()}.csv`, 'text/csv;charset=utf-8')
        } else if (!abrirVistaPdf(titulo, columns, filteredRows)) {
            setNotification({ type: 'error', message: 'El navegador bloqueó la ventana del PDF' })
            return
        }
        registrarBitacora(`El usuario exporta a ${formato.toUpperCase()} el historial académico de ${identificacion.trim()}`)
    }

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
                data={filteredRows}
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

                            <Col md={4} lg={3}>
                                <Form.Label>Año</Form.Label>
                                <Form.Select value={anio} onChange={event => { setAnio(event.target.value); setPeriodo('') }} disabled={!rows.length}>
                                    <option value="">Todos</option>
                                    {anios.map(value => <option key={value} value={value}>{value}</option>)}
                                </Form.Select>
                            </Col>

                            <Col md={4} lg={3}>
                                <Form.Label>Periodo</Form.Label>
                                <Form.Select value={periodo} onChange={event => setPeriodo(event.target.value)} disabled={!rows.length}>
                                    <option value="">Todos</option>
                                    {periodos.map(value => <option key={value} value={value}>{value}</option>)}
                                </Form.Select>
                            </Col>

                            <Col md={4} lg={6} className="d-flex gap-2">
                                <Button type="button" variant="outline-primary" onClick={() => exportar('csv')} disabled={!filteredRows.length || loading}>
                                    <i className="bi bi-filetype-csv me-2" />CSV
                                </Button>
                                <Button type="button" variant="outline-primary" onClick={() => exportar('pdf')} disabled={!filteredRows.length || loading}>
                                    <i className="bi bi-file-earmark-pdf me-2" />PDF
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                )}
            />
        </div>
    )
}
