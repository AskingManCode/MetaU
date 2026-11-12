import { useEffect, useMemo, useState } from 'react'
import { Badge, Form } from 'react-bootstrap'
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
        errorCarga
    } = useFacturas()

    const [filtroEstudiante, setFiltroEstudiante] = useState('')
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

    const acciones = [
        {
            type: 'ver',
            onClick: factura =>
                navigate(`/facturas/ver/${encodeURIComponent(factura.facturaID)}`)
        }
    ]

    const formularioFiltros = (
        <div className="row g-3 align-items-end">
            <div className="col-md-3">
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

            <div className="col-md-3">
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
        </div>
    )
}

export default Facturas
