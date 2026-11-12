import { useMemo, useState } from 'react'
import { Badge, Form } from 'react-bootstrap'
import DataTable from '../../../components/DataTable'
import {
    ESTADOS_NOTIFICACION,
    formatearFecha,
    obtenerBadgeEstado,
    textoBusqueda
} from '../../../utils/notificacionUtils'

const columnas = [
    {
        key: 'notificacionID',
        label: 'N°',
        sortable: true,
        render: n => <span className="fw-semibold text-secondary">#{n.notificacionID}</span>
    },
    {
        key: 'fechaEnvio',
        label: 'Fecha',
        sortable: true,
        sortValue: n => n.fechaEnvio ? new Date(n.fechaEnvio).getTime() : (n.fechaCreacion ? new Date(n.fechaCreacion).getTime() : 0),
        render: n => formatearFecha(n.fechaEnvio || n.fechaCreacion)
    },
    {
        key: 'emailDestino',
        label: 'Destinatario(s)',
        sortable: true,
        render: n => (
            <span className="text-break" title={n.emailDestino}>
                {n.emailDestino}
            </span>
        )
    },
    {
        key: 'asunto',
        label: 'Asunto',
        sortable: true,
        render: n => (
            <span className="fw-medium text-dark text-break" title={n.asunto}>
                {n.asunto.length > 50 ? `${n.asunto.slice(0, 50)}...` : n.asunto}
            </span>
        )
    },
    {
        key: 'estadoNotificacion',
        label: 'Estado',
        sortable: true,
        render: n => {
            const badge = obtenerBadgeEstado(n.estadoNotificacion)
            const bgClass = badge.className.replace('badge bg-', '').replace(' text-dark', '')
            return (
                <Badge bg={bgClass}>
                    {badge.label}
                </Badge>
            )
        }
    }
]

export default function NotificacionHistorial({
    notificaciones = [],
    loading = false,
    errorCarga = null,
    onVerDetalle,
    onRecargar
}) {
    const [filtroTexto, setFiltroTexto] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')

    const notificacionesFiltradas = useMemo(() => {
        const termino = textoBusqueda(filtroTexto.trim())

        return notificaciones.filter(n => {
            const coincideTexto =
                !termino ||
                textoBusqueda(n.emailDestino).includes(termino) ||
                textoBusqueda(n.asunto).includes(termino) ||
                String(n.notificacionID).includes(termino)

            const coincideEstado =
                filtroEstado === 'Todos' ||
                String(n.estadoNotificacion).toUpperCase() === filtroEstado.toUpperCase()

            return coincideTexto && coincideEstado
        })
    }, [notificaciones, filtroTexto, filtroEstado])

    const limpiarFiltros = () => {
        setFiltroTexto('')
        setFiltroEstado('Todos')
    }

    const acciones = [
        {
            type: 'ver',
            onClick: notificacion => onVerDetalle(notificacion)
        }
    ]

    const formularioFiltros = (
        <div className="row g-2 align-items-end">
            <div className="col-md-5">
                <label className="form-label small text-muted mb-1">
                    Buscar (Destinatario, Asunto o N°)
                </label>
                <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Escriba para buscar..."
                    value={filtroTexto}
                    onChange={e => setFiltroTexto(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="col-md-4">
                <label className="form-label small text-muted mb-1">
                    Estado
                </label>
                <Form.Select
                    size="sm"
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    disabled={loading}
                >
                    {ESTADOS_NOTIFICACION.map(est => (
                        <option key={est} value={est}>
                            {est}
                        </option>
                    ))}
                </Form.Select>
            </div>

            <div className="col-md-3 d-flex gap-2">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={limpiarFiltros}
                    disabled={loading}
                    title="Limpiar filtros de búsqueda"
                >
                    <i className="bi bi-arrow-counterclockwise me-1" />
                    Limpiar
                </button>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={onRecargar}
                    disabled={loading}
                    title="Actualizar lista de notificaciones"
                >
                    <i className="bi bi-arrow-repeat" />
                </button>
            </div>
        </div>
    )

    return (
        <DataTable
            title="Historial de Notificaciones"
            columns={columnas}
            data={notificacionesFiltradas}
            actions={acciones}
            rowKey="notificacionID"
            loading={loading}
            filters={formularioFiltros}
            pageSize={15}
            emptyMessage={
                errorCarga ||
                (notificaciones.length === 0
                    ? 'No hay notificaciones registradas en el sistema'
                    : 'No se encontraron notificaciones que coincidan con los filtros')
            }
        />
    )
}
