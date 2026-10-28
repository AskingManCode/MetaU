
import { useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import BitacoraDetalle from '../../../components/BitacoraDetalle'
import useBitacoras, { normalizarTexto, obtenerAccion } from '../../../hooks/useBitacoras'

const columnas = [
    { key: 'idBitacora', label: 'ID', sortable: true },
    { key: 'fechaBitacora', label: 'Fecha', sortable: true, render: b => b.fechaBitacora ? new Date(b.fechaBitacora).toLocaleString('es-CR') : '-' },
    { key: 'usuario', label: 'Usuario', sortable: true },
    { key: 'accion', label: 'Accion', sortable: true, accessor: b => obtenerAccion(b.descripcion) },
    { key: 'descripcion', label: 'Descripcion', render: b => b.descripcion.length > 90 ? `${b.descripcion.slice(0, 90)}...` : b.descripcion }
]

export default function Bitacoras() {
    const { bitacoras, loading, notification, setNotification, errorCarga } = useBitacoras()
    const [detalle, setDetalle] = useState(null)
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [usuario, setUsuario] = useState('')
    const [accion, setAccion] = useState('Todas')
    const [modulo, setModulo] = useState('')

    const fechasInvalidas = !!fechaInicio && !!fechaFin && fechaInicio > fechaFin

    const filtradas = useMemo(() => {
        if (fechasInvalidas) return []

        return bitacoras.filter(b => {
            const fecha = String(b.fechaBitacora ?? '').slice(0, 10)
            const descripcion = normalizarTexto(b.descripcion)

            const coincideInicio = !fechaInicio || fecha >= fechaInicio
            const coincideFin = !fechaFin || fecha <= fechaFin
            const coincideUsuario = normalizarTexto(b.usuario).includes(normalizarTexto(usuario))
            const coincideAccion = accion === 'Todas' || obtenerAccion(b.descripcion) === accion
            const coincideModulo = !modulo || descripcion.includes(normalizarTexto(modulo))

            return coincideInicio && coincideFin && coincideUsuario && coincideAccion && coincideModulo
        }).sort((a, b) => new Date(b.fechaBitacora) - new Date(a.fechaBitacora))
    }, [bitacoras, fechaInicio, fechaFin, usuario, accion, modulo, fechasInvalidas])

    const acciones = [
        { type: 'ver', onClick: b => setDetalle(b) }
    ]

    const limpiarFiltros = () => {
        setFechaInicio('')
        setFechaFin('')
        setUsuario('')
        setAccion('Todas')
        setModulo('')
    }

    const filtros = (
        <div>
            <div className="row g-2">
                <div className="col-md-3">
                    <Form.Label className="small mb-1">Fecha inicio</Form.Label>
                    <Form.Control size="sm" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                </div>

                <div className="col-md-3">
                    <Form.Label className="small mb-1">Fecha fin</Form.Label>
                    <Form.Control size="sm" type="date" min={fechaInicio || undefined} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>

                <div className="col-md-3">
                    <Form.Label className="small mb-1">Usuario</Form.Label>
                    <Form.Control size="sm" placeholder="Buscar por usuario" value={usuario} onChange={e => setUsuario(e.target.value)} />
                </div>

                <div className="col-md-3">
                    <Form.Label className="small mb-1">Accion</Form.Label>
                    <Form.Select size="sm" value={accion} onChange={e => setAccion(e.target.value)}>
                        <option value="Todas">Todas</option>
                        <option value="Crear">Crear</option>
                        <option value="Modificar">Modificar</option>
                        <option value="Eliminar">Eliminar</option>
                        <option value="Consultar">Consultar</option>
                        <option value="Error">Error</option>
                        <option value="Otra">Otra</option>
                    </Form.Select>
                </div>

                <div className="col-md-9">
                    <Form.Label className="small mb-1">Modulo</Form.Label>
                    <Form.Control size="sm" placeholder="Buscar texto del modulo en la descripcion" value={modulo} onChange={e => setModulo(e.target.value)} />
                </div>

                <div className="col-md-3 d-flex align-items-end">
                    <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={limpiarFiltros}>
                        <i className="bi bi-arrow-counterclockwise me-2" />
                        Limpiar filtros
                    </button>
                </div>
            </div>

            {fechasInvalidas && <small className="text-danger d-block mt-2">La fecha de fin no puede ser anterior a la fecha de inicio</small>}
        </div>
    )

    return (
        <div>
            <PageHeader title="Consulta de Bitacoras" />

            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtradas}
                actions={acciones}
                rowKey="idBitacora"
                loading={loading}
                filters={filtros}
                pageSize={15}
                emptyMessage={errorCarga ? 'No se pudieron cargar las bitacoras' : 'No hay bitacoras para mostrar'}
            />

            <BitacoraDetalle bitacora={detalle} onClose={() => setDetalle(null)} />
        </div>
    )
}
