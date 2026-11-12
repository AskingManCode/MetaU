import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useListado from '../../../hooks/useListado'
import moduloService from '../../../services/moduloService'
import { mensajeError, normalizarModulo, textoBusqueda } from '../../../utils/sistemaUtils'

const columnas = [
    { key: 'idModulo', label: 'Codigo', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'orden', label: 'Orden', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true, render: m => m.estado ? 'Activo' : 'Inactivo' }
]

function Modulos() {
    const navigate = useNavigate()
    const location = useLocation()

    const [codigo, setCodigo] = useState('')
    const [nombre, setNombre] = useState('')
    const [ordenTabla, setOrdenTabla] = useState({ key: null, direction: 'asc' })
    const [eliminando, setEliminando] = useState(false)

    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )

    const tieneFiltros = Boolean(codigo.trim() || nombre.trim())
    const listaCompleta = tieneFiltros || Boolean(ordenTabla.key)

    const {
        registros,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas,
        loading,
        errorCarga,
        eliminar
    } = useListado({
        servicio: moduloService,
        normalizar: normalizarModulo,
        nombre: 'modulos',
        listaCompleta
    })

    useEffect(() => {
        if (location.state?.mensaje) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    useEffect(() => {
        if (errorCarga) {
            setNotification({ type: 'error', message: errorCarga })
        }
    }, [errorCarga])

    const filtrados = useMemo(() => registros.filter(m =>
        textoBusqueda(m.idModulo).includes(textoBusqueda(codigo)) &&
        textoBusqueda(m.nombre).includes(textoBusqueda(nombre))
    ), [registros, codigo, nombre])

    const cambiarFiltro = (campo, valor) => {
        if (campo === 'codigo') setCodigo(valor)
        if (campo === 'nombre') setNombre(valor)
        setPagina(1)
    }

    const limpiarFiltros = () => {
        setCodigo('')
        setNombre('')
        setPagina(1)
    }

    const cambiarOrden = nuevoOrden => {
        setOrdenTabla(nuevoOrden)
        setPagina(1)
    }

    const confirmarEliminacion = modulo => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar el elemento seleccionado?',
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                if (eliminando) return

                setEliminando(true)
                setNotification(null)

                try {
                    await eliminar(modulo.idModulo)
                    setNotification({ type: 'success', message: 'Modulo eliminado correctamente' })
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(error, 'No se pudo eliminar el modulo')
                    })
                } finally {
                    setEliminando(false)
                }
            }
        })
    }

    const filtros = (
        <div className="row g-2">
            <div className="col-md-4">
                <Form.Label className="small mb-1">Codigo</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar codigo"
                    value={codigo}
                    onChange={e => cambiarFiltro('codigo', e.target.value)}
                />
            </div>

            <div className="col-md-4">
                <Form.Label className="small mb-1">Nombre</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar nombre"
                    value={nombre}
                    onChange={e => cambiarFiltro('nombre', e.target.value)}
                />
            </div>

            <div className="col-md-4 d-flex align-items-end">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={limpiarFiltros}
                >
                    <i className="bi bi-arrow-counterclockwise me-2" />
                    Limpiar filtros
                </button>
            </div>
        </div>
    )

    const acciones = [
        {
            type: 'editar',
            onClick: modulo => navigate(`/modulos/editar/${modulo.idModulo}`)
        },
        {
            type: 'eliminar',
            onClick: confirmarEliminacion,
            disabled: eliminando
        }
    ]

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
                title="Mantenimiento de Modulos"
                buttonLabel="Nuevo Modulo"
                onButtonClick={() => navigate('/modulos/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtrados}
                actions={acciones}
                rowKey="idModulo"
                loading={loading}
                filters={filtros}
                pageSize={15}
                serverPagination={!listaCompleta}
                currentPage={pagina}
                totalPages={totalPaginas}
                totalRecords={totalRegistros}
                onPageChange={setPagina}
                onSortChange={cambiarOrden}
                emptyMessage={
                    errorCarga
                        ? 'No se pudieron cargar los modulos'
                        : 'No hay modulos para mostrar'
                }
            />
        </div>
    )
}

export default Modulos