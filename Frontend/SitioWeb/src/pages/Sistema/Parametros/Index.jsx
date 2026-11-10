import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useListado from '../../../hooks/useListado'
import parametroService from '../../../services/parametroService'
import { mensajeError, normalizarParametro, textoBusqueda } from '../../../utils/sistemaUtils'

const columnas = [
    { key: 'parametroCode', label: 'Codigo', sortable: true },
    { key: 'valor', label: 'Valor', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true, render: p => p.estado ? 'Activo' : 'Inactivo' }
]

function Parametros() {
    const navigate = useNavigate()
    const location = useLocation()

    const [codigo, setCodigo] = useState('')
    const [valor, setValor] = useState('')
    const [ordenTabla, setOrdenTabla] = useState({ key: null, direction: 'asc' })
    const [eliminando, setEliminando] = useState(false)

    const [errorOculto, setErrorOculto] = useState(null)
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )

    const tieneFiltros = Boolean(codigo.trim() || valor.trim())
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
        servicio: parametroService,
        normalizar: normalizarParametro,
        nombre: 'parametros',
        listaCompleta
    })

    useEffect(() => {
        if (location.state?.mensaje) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    const notificacionVisible = notification ?? (
        errorCarga && errorCarga !== errorOculto
            ? { type: 'error', message: errorCarga }
            : null
    )

    const cerrarNotificacion = () => {
        if (notification) {
            setNotification(null)
            return
        }

        if (errorCarga) {
            setErrorOculto(errorCarga)
        }
    }

    const filtrados = useMemo(() => registros.filter(p =>
        textoBusqueda(p.parametroCode).includes(textoBusqueda(codigo)) &&
        textoBusqueda(p.valor).includes(textoBusqueda(valor))
    ), [registros, codigo, valor])

    const cambiarFiltro = (campo, nuevoValor) => {
        if (campo === 'codigo') setCodigo(nuevoValor)
        if (campo === 'valor') setValor(nuevoValor)
        setPagina(1)
    }

    const limpiarFiltros = () => {
        setCodigo('')
        setValor('')
        setPagina(1)
    }

    const cambiarOrden = nuevoOrden => {
        setOrdenTabla(nuevoOrden)
        setPagina(1)
    }

    const confirmarEliminacion = parametro => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar el elemento seleccionado?',
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                if (eliminando) return

                setEliminando(true)
                setNotification(null)

                try {
                    await eliminar(parametro.parametroCode)
                    setNotification({ type: 'success', message: 'Parametro eliminado correctamente' })
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(error, 'No se pudo eliminar el parametro')
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
                <Form.Label className="small mb-1">Valor</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar valor"
                    value={valor}
                    onChange={e => cambiarFiltro('valor', e.target.value)}
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
            onClick: parametro => navigate(`/parametros/editar/${encodeURIComponent(parametro.parametroCode)}`)
        },
        {
            type: 'eliminar',
            onClick: confirmarEliminacion,
            disabled: parametro => eliminando || !parametro.estado
        }
    ]

    return (
        <div>
            <Notification
                type={notificacionVisible?.type}
                message={notificacionVisible?.message}
                show={!!notificacionVisible}
                onClose={cerrarNotificacion}
                onConfirm={notificacionVisible?.onConfirm}
                onCancel={notificacionVisible?.onCancel}
            />

            <MaintenanceHeader
                title="Mantenimiento de Parametros"
                buttonLabel="Nuevo Parametro"
                onButtonClick={() => navigate('/parametros/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtrados}
                actions={acciones}
                rowKey="parametroCode"
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
                        ? 'No se pudieron cargar los parametros'
                        : 'No hay parametros para mostrar'
                }
            />
        </div>
    )
}

export default Parametros
