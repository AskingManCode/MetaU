
import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import usePeriodos, { obtenerEstado } from '../../../hooks/usePeriodos'

const columnas = [
    { key: 'anio', label: 'Anio', sortable: true },
    { key: 'numeroPeriodo', label: 'Periodo', sortable: true },
    {
        key: 'fechaInicio',
        label: 'Fecha inicio',
        sortable: true,
        render: p => p.fechaInicio?.slice(0, 10)
    },
    {
        key: 'fechaFin',
        label: 'Fecha fin',
        sortable: true,
        render: p => p.fechaFin?.slice(0, 10)
    },
    {
        key: 'estado',
        label: 'Estado',
        sortable: true,
        accessor: obtenerEstado
    }
]

export default function Periodos() {
    const navigate = useNavigate()
    const location = useLocation()

    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('Todos')
    const [ordenTabla, setOrdenTabla] = useState({
        key: null,
        direction: 'asc'
    })

    const tieneFiltros = Boolean(
        busqueda.trim() ||
        filtroEstado !== 'Todos'
    )

    const listaCompleta = tieneFiltros || Boolean(ordenTabla.key)

    const {
        periodos,
        notification,
        setNotification,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas,
        loading,
        eliminando,
        errorCarga,
        eliminar
    } = usePeriodos(location.state?.mensaje, { listaCompleta })

    useEffect(() => {
        if (location.state?.mensaje) {
            navigate(location.pathname, {
                replace: true,
                state: null
            })
        }
    }, [location.state, location.pathname, navigate])

    const filtrados = useMemo(() => {
        return periodos.filter(p => {
            const coincideBusqueda = `${p.anio} ${p.numeroPeriodo}`
                .toLowerCase()
                .includes(busqueda.toLowerCase().trim())

            const coincideEstado =
                filtroEstado === 'Todos' ||
                obtenerEstado(p) === filtroEstado

            return coincideBusqueda && coincideEstado
        })
    }, [periodos, busqueda, filtroEstado])

    const cambiarBusqueda = valor => {
        setBusqueda(valor)
        setPagina(1)
    }

    const cambiarEstado = valor => {
        setFiltroEstado(valor)
        setPagina(1)
    }

    const cambiarOrden = nuevoOrden => {
        setOrdenTabla(nuevoOrden)
        setPagina(1)
    }

    const acciones = [
        {
            type: 'editar',
            onClick: p => navigate(`/periodos/editar/${p.periodoID}`)
        },
        {
            type: 'eliminar',
            onClick: eliminar,
            disabled: eliminando
        }
    ]

    const filtros = (
        <div className="row g-2">
            <div className="col-md-8">
                <Form.Control
                    size="sm"
                    placeholder="Buscar por anio o numero de periodo"
                    value={busqueda}
                    onChange={e => cambiarBusqueda(e.target.value)}
                />
            </div>

            <div className="col-md-4">
                <Form.Select
                    size="sm"
                    value={filtroEstado}
                    onChange={e => cambiarEstado(e.target.value)}
                >
                    <option value="Todos">Todos los estados</option>
                    <option value="Futuro">Futuros</option>
                    <option value="Activo">Activos</option>
                    <option value="Cerrado">Cerrados</option>
                </Form.Select>
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
                onConfirm={notification?.onConfirm}
                onCancel={notification?.onCancel}
            />

            <MaintenanceHeader
                title="Mantenimiento de Periodos"
                buttonLabel="Nuevo"
                onButtonClick={() => navigate('/periodos/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtrados}
                actions={acciones}
                rowKey="periodoID"
                loading={loading}
                pageSize={15}
                filters={filtros}
                serverPagination={!listaCompleta}
                currentPage={pagina}
                totalPages={totalPaginas}
                totalRecords={totalRegistros}
                onPageChange={setPagina}
                onSortChange={cambiarOrden}
                emptyMessage={
                    errorCarga
                        ? 'No se pudieron cargar los periodos'
                        : 'No hay periodos registrados'
                }
            />
        </div>
    )
}
