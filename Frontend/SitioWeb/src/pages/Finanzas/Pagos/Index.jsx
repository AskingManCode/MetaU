import { useEffect, useMemo, useState } from 'react'
import { Badge, Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import usePagos from '../../../hooks/usePagos'
import {
    ESTADOS_PAGO,
    badgeEstadoPago,
    formatearFecha,
    formatearMoneda,
    formatearNombrePeriodo,
    normalizarTexto
} from '../../../utils/pagoUtils'

const columnas = [
    {
        key: 'pagoID',
        label: 'N° Pago',
        sortable: true,
        render: p => `#${p.pagoID}`
    },
    {
        key: 'facturaID',
        label: 'N° Factura',
        sortable: true,
        render: p => `#${p.facturaID}`
    },
    {
        key: 'identificacionEstudiante',
        label: 'Estudiante',
        sortable: true
    },
    {
        key: 'fechaPago',
        label: 'Fecha Pago',
        sortable: true,
        render: p => formatearFecha(p.fechaPago)
    },
    {
        key: 'monto',
        label: 'Monto',
        sortable: true,
        sortValue: p => p.monto,
        render: p => (
            <span className="fw-semibold text-primary">
                {formatearMoneda(p.monto)}
            </span>
        )
    },
    {
        key: 'estado',
        label: 'Estado',
        sortable: true,
        render: p => (
            <Badge bg={badgeEstadoPago(p.estado)}>
                {p.estado}
            </Badge>
        )
    }
]

function Pagos() {
    const navigate = useNavigate()
    const location = useLocation()

    const {
        periodos,
        periodoSeleccionado,
        setPeriodoSeleccionado,
        pagos,
        loading,
        errorCarga
    } = usePagos()

    const [filtroTexto, setFiltroTexto] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')
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

    const pagosFiltrados = useMemo(() => {
        const termino = normalizarTexto(filtroTexto.trim())
        return pagos.filter(p => {
            const coincideTexto =
                !termino ||
                normalizarTexto(p.identificacionEstudiante).includes(termino) ||
                normalizarTexto(p.pagoID).includes(termino) ||
                normalizarTexto(p.facturaID).includes(termino)
            const coincideEstado =
                filtroEstado === 'Todos' || p.estado === filtroEstado
            return coincideTexto && coincideEstado
        })
    }, [pagos, filtroTexto, filtroEstado])

    const limpiarFiltros = () => {
        setFiltroTexto('')
        setFiltroEstado('Todos')
    }

    const acciones = [
        {
            type: 'ver',
            onClick: pago =>
                navigate(`/pagos/ver/${encodeURIComponent(pago.pagoID)}`)
        }
    ]

    const formularioFiltros = (
        <div className="row g-2 align-items-end">
            <div className="col-md-3">
                <label className="form-label small text-muted mb-1">
                    Periodo Lectivo
                </label>
                <Form.Select
                    size="sm"
                    value={periodoSeleccionado}
                    onChange={e => setPeriodoSeleccionado(e.target.value)}
                    disabled={loading || periodos.length === 0}
                >
                    {periodos.length === 0 ? (
                        <option value="">No hay periodos disponibles</option>
                    ) : (
                        periodos.map(p => (
                            <option key={p.periodoID} value={p.periodoID}>
                                {formatearNombrePeriodo(p)}
                            </option>
                        ))
                    )}
                </Form.Select>
            </div>

            <div className="col-md-3">
                <label className="form-label small text-muted mb-1">
                    Buscar (Estudiante, N° Factura o Pago)
                </label>
                <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Identificación o ID..."
                    value={filtroTexto}
                    onChange={e => setFiltroTexto(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="col-md-3">
                <label className="form-label small text-muted mb-1">
                    Estado
                </label>
                <Form.Select
                    size="sm"
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    disabled={loading}
                >
                    {ESTADOS_PAGO.map(est => (
                        <option key={est} value={est}>
                            {est}
                        </option>
                    ))}
                </Form.Select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={limpiarFiltros}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-counterclockwise me-2" />
                    Limpiar filtros
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
                title="Mantenimiento de Pagos"
                buttonLabel="Nuevo Pago"
                onButtonClick={() => navigate('/pagos/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={pagosFiltrados}
                actions={acciones}
                rowKey="pagoID"
                loading={loading}
                filters={formularioFiltros}
                pageSize={15}
                emptyMessage={
                    errorCarga ||
                    (pagos.length === 0
                        ? 'No hay pagos registrados en el periodo seleccionado'
                        : 'No se encontraron pagos que coincidan con los filtros')
                }
            />
        </div>
    )
}

export default Pagos
