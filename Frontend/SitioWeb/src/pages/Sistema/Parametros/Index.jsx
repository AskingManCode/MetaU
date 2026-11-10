import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useListado from '../../../hooks/useListado'
import parametroService from '../../../services/parametroService'
import { mensajeError, normalizarParametro } from '../../../utils/sistemaUtils'

const columnas = [
    { key: 'parametroCode', label: 'Codigo' },
    { key: 'valor', label: 'Valor' },
    { key: 'estado', label: 'Estado', render: p => p.estado ? 'Activo' : 'Inactivo' }
]

function Parametros() {
    const navigate = useNavigate()
    const location = useLocation()

    const [eliminando, setEliminando] = useState(false)
    const [errorOculto, setErrorOculto] = useState(null)
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )

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
        nombre: 'parametros'
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

    const confirmarEliminacion = parametro => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar el elemento seleccionado? Esto podría alterar el funcionamiento correcto del sistema.',
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
                data={registros}
                actions={acciones}
                rowKey="parametroCode"
                loading={loading}
                pageSize={15}
                serverPagination
                currentPage={pagina}
                totalPages={totalPaginas}
                totalRecords={totalRegistros}
                onPageChange={setPagina}
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
