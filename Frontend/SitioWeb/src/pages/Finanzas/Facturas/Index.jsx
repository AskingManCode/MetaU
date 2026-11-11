import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import useFacturas from '../../../hooks/useFacturas'
import {
    ESTADOS_FACTURA,
    badgeEstadoFactura,
    formatearFecha,
    formatearMoneda,
    formatearNombrePeriodo,
    mensajeErrorFactura,
    normalizarTexto
} from '../../../utils/facturaUtils'

const columnas = [
    {
        key: 'facturaID',
        label: 'N° Factura',
        sortable: true,
        render: f => `#${f.facturaID}`
    },
    {
        key: 'identificacionEstudiante',
        label: 'Estudiante',
        sortable: true
    },
    {
        key: 'fechaEmision',
        label: 'Fecha Emisión',
        sortable: true,
        render: f => formatearFecha(f.fechaEmision)
    },
    {
        key: 'subtotal',
        label: 'Subtotal',
        sortable: true,
        sortValue: f => f.subtotal,
        render: f => formatearMoneda(f.subtotal)
    },
    {
        key: 'impuesto',
        label: 'Impuesto (2%)',
        sortable: true,
        sortValue: f => f.impuesto,
        render: f => formatearMoneda(f.impuesto)
    },
    {
        key: 'total',
        label: 'Total',
        sortable: true,
        sortValue: f => f.total,
        render: f => (
            <span className="fw-semibold text-primary">
                {formatearMoneda(f.total)}
            </span>
        )
    },
    {
        key: 'estado',
        label: 'Estado',
        sortable: true,
        render: f => (
            <Badge
                bg={badgeEstadoFactura(f.estado)}
                text={f.estado === 'Pendiente de Cobro' ? 'dark' : undefined}
            >
                {f.estado}
            </Badge>
        )
    }
]

function Facturas() {
    const navigate = useNavigate()
    const location = useLocation()

    const {
        periodos,
        periodoSeleccionado,
        setPeriodoSeleccionado,
        facturas,
        loading,
        errorCarga,
        anularFactura
    } = useFacturas()

    const [filtroEstudiante, setFiltroEstudiante] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')
    const [facturaAAnular, setFacturaAAnular] = useState(null)
    const [motivoAnulacion, setMotivoAnulacion] = useState('')
    const [errorMotivo, setErrorMotivo] = useState(null)
    const [anulando, setAnulando] = useState(false)
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )

    useEffect(() => {
        if (location.state?.mensaje) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    const facturasFiltradas = useMemo(() => {
        const termino = normalizarTexto(filtroEstudiante.trim())
        return facturas.filter(f => {
            const coincideEstudiante =
                !termino || normalizarTexto(f.identificacionEstudiante).includes(termino)
            const coincideEstado =
                filtroEstado === 'Todos' || f.estado === filtroEstado
            return coincideEstudiante && coincideEstado
        })
    }, [facturas, filtroEstudiante, filtroEstado])

    const limpiarFiltros = () => {
        setFiltroEstudiante('')
        setFiltroEstado('Todos')
    }

    const abrirModalAnular = factura => {
        setFacturaAAnular(factura)
        setMotivoAnulacion('')
        setErrorMotivo(null)
    }

    const cerrarModalAnular = () => {
        if (anulando) return
        setFacturaAAnular(null)
        setMotivoAnulacion('')
        setErrorMotivo(null)
    }

    const ejecutarAnulacion = async () => {
        const motivoLimpio = motivoAnulacion.trim()
        if (!motivoLimpio) {
            setErrorMotivo('El motivo de anulación es obligatorio.')
            return
        }
        if (motivoLimpio.length > 250) {
            setErrorMotivo('El motivo no puede exceder 250 caracteres.')
            return
        }

        setAnulando(true)
        setErrorMotivo(null)

        try {
            await anularFactura(facturaAAnular.facturaID, motivoLimpio)
            setNotification({
                type: 'success',
                message: `La factura #${facturaAAnular.facturaID} fue anulada exitosamente.`
            })
            cerrarModalAnular()
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorFactura(error, 'No se pudo anular la factura.')
            })
        } finally {
            setAnulando(false)
        }
    }

    const acciones = [
        {
            type: 'ver',
            onClick: factura =>
                navigate(`/facturas/ver/${encodeURIComponent(factura.facturaID)}`)
        },
        {
            type: 'eliminar',
            onClick: abrirModalAnular,
            disabled: factura =>
                anulando ||
                factura.estado === 'Anulada' ||
                factura.estado === 'Pagada'
        }
    ]

    const formularioFiltros = (
        <div className="row g-2 align-items-end">
            <div className="col-md-4">
                <Form.Label className="small mb-1 fw-semibold">Periodo</Form.Label>
                <Form.Select
                    size="sm"
                    value={periodoSeleccionado}
                    onChange={e => setPeriodoSeleccionado(e.target.value)}
                    disabled={loading}
                >
                    {periodos.length === 0 && (
                        <option value="">Cargando periodos...</option>
                    )}
                    {periodos.map(p => (
                        <option key={p.periodoID} value={p.periodoID}>
                            {formatearNombrePeriodo(p)}
                        </option>
                    ))}
                </Form.Select>
            </div>

            <div className="col-md-4">
                <Form.Label className="small mb-1 fw-semibold">Estudiante</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Identificación del estudiante"
                    value={filtroEstudiante}
                    onChange={e => setFiltroEstudiante(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="col-md-3">
                <Form.Label className="small mb-1 fw-semibold">Estado</Form.Label>
                <Form.Select
                    size="sm"
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    disabled={loading}
                >
                    {ESTADOS_FACTURA.map(e => (
                        <option key={e} value={e}>
                            {e}
                        </option>
                    ))}
                </Form.Select>
            </div>

            <div className="col-md-1 d-flex justify-content-end">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={limpiarFiltros}
                    disabled={loading || (!filtroEstudiante && filtroEstado === 'Todos')}
                    title="Limpiar filtros"
                >
                    <i className="bi bi-arrow-counterclockwise" />
                </button>
            </div>
        </div>
    )

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <MaintenanceHeader
                title="Mantenimiento de Facturas"
                buttonLabel="Nueva Factura"
                onButtonClick={() => navigate('/facturas/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={facturasFiltradas}
                actions={acciones}
                rowKey="facturaID"
                loading={loading}
                filters={formularioFiltros}
                pageSize={15}
                emptyMessage={
                    errorCarga ||
                    (facturas.length === 0
                        ? 'No hay facturas registradas en el periodo seleccionado'
                        : 'No se encontraron facturas que coincidan con los filtros')
                }
            />

            <Modal
                show={!!facturaAAnular}
                onHide={cerrarModalAnular}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="h5">Anular Factura</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-3">
                        ¿Realmente desea anular la factura{' '}
                        <strong>#{facturaAAnular?.facturaID}</strong> correspondiente al estudiante{' '}
                        <strong>{facturaAAnular?.identificacionEstudiante}</strong>? Esta acción no se puede revertir.
                    </p>
                    <Form.Group controlId="motivoAnulacion">
                        <Form.Label className="small fw-semibold">
                            Motivo de la anulación <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Indique el motivo por el cual se anula la factura..."
                            value={motivoAnulacion}
                            onChange={e => {
                                setMotivoAnulacion(e.target.value)
                                if (errorMotivo) setErrorMotivo(null)
                            }}
                            maxLength={250}
                            disabled={anulando}
                            isInvalid={!!errorMotivo}
                        />
                        <div className="d-flex justify-content-between mt-1">
                            <span className="text-danger small">{errorMotivo}</span>
                            <span className="text-muted small ms-auto">
                                {motivoAnulacion.length}/250 caracteres
                            </span>
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={cerrarModalAnular}
                        disabled={anulando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={ejecutarAnulacion}
                        disabled={anulando || !motivoAnulacion.trim()}
                    >
                        {anulando ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Anulando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-x-circle me-1" />
                                Confirmar Anulación
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Facturas
