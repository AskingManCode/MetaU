import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import useInstituciones from '../../../hooks/useInstituciones'
import carreraService from '../../../services/carreraService'
import institucionService from '../../../services/institucionService'
import { mensajeErrorInstitucion, textoInstitucion } from '../../../utils/institucionUtils'

const columnas = [
    { key: 'institucionCode', label: 'Código' },
    { key: 'nombre', label: 'Nombre' }
]

function Instituciones() {
    const navigate = useNavigate()
    const location = useLocation()
    const [busqueda, setBusqueda] = useState('')
    const [pagina, setPagina] = useState(1)
    const [eliminando, setEliminando] = useState(false)
    const [errorDescartado, setErrorDescartado] = useState(null)
    const [registroDestacado, setRegistroDestacado] = useState(
        location.state?.institucionCode ?? null
    )
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )

    const {
        instituciones,
        pageSize,
        loading,
        errorCarga,
        errorConfiguracion,
        recargar
    } = useInstituciones()

    useEffect(() => {
        if (location.state?.mensaje || location.state?.institucionCode) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    const filtradas = useMemo(() => {
        const termino = textoInstitucion(busqueda)
        return instituciones.filter(institucion =>
            textoInstitucion(institucion.nombre).includes(termino)
        )
    }, [instituciones, busqueda])

    const indiceDestacado = loading || !registroDestacado
        ? -1
        : instituciones.findIndex(
            institucion => institucion.institucionCode === registroDestacado
        )
    const paginaActual = indiceDestacado >= 0
        ? Math.floor(indiceDestacado / pageSize) + 1
        : pagina
    const errorFuente = errorCarga || errorConfiguracion
    const errorVisible = errorFuente && errorFuente !== errorDescartado
    const notificacionVisible = notification || (errorVisible
        ? { type: 'error', message: errorFuente }
        : null)

    const cerrarNotificacion = () => {
        if (!notification && errorVisible) {
            setErrorDescartado(errorFuente)
            return
        }
        setNotification(null)
    }

    const confirmarEliminacion = institucion => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar el elemento seleccionado?',
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                if (eliminando) return

                setEliminando(true)
                setNotification(null)

                try {
                    const { data } = await carreraService.getByInstitucion(
                        institucion.institucionCode
                    )
                    const carreras = Array.isArray(data) ? data : data?.datos

                    if (!Array.isArray(carreras)) {
                        throw new Error(
                            'No se pudo verificar si la institución tiene carreras asociadas.'
                        )
                    }

                    if (carreras.length > 0) {
                        setNotification({
                            type: 'error',
                            message: 'No se puede eliminar la institución porque tiene carreras asociadas.'
                        })
                        return
                    }

                    await institucionService.delete(institucion.institucionCode)
                    setNotification({
                        type: 'success',
                        message: 'Institución eliminada correctamente'
                    })
                    recargar()
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: mensajeErrorInstitucion(
                            error,
                            error?.response
                                ? 'No se pudo eliminar la institución.'
                                : 'No se pudo verificar si la institución tiene carreras asociadas.'
                        )
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
            onClick: institucion => navigate(
                `/instituciones/editar/${encodeURIComponent(institucion.institucionCode)}`
            )
        },
        {
            type: 'eliminar',
            onClick: confirmarEliminacion,
            disabled: eliminando
        }
    ]

    const filtros = (
        <Form.Group controlId="buscarInstitucion">
            <Form.Label className="small mb-1">Buscar por nombre</Form.Label>
            <Form.Control
                size="sm"
                type="search"
                placeholder="Buscar nombre"
                value={busqueda}
                onChange={event => {
                    setBusqueda(event.target.value)
                    setPagina(1)
                    setRegistroDestacado(null)
                }}
            />
        </Form.Group>
    )

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
                title="Mantenimiento de Instituciones"
                buttonLabel="Nueva Institución"
                onButtonClick={() => navigate('/instituciones/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtradas}
                actions={acciones}
                rowKey="institucionCode"
                loading={loading}
                filters={filtros}
                pageSize={pageSize}
                currentPage={paginaActual}
                onPageChange={nuevaPagina => {
                    setPagina(nuevaPagina)
                    setRegistroDestacado(null)
                }}
                emptyMessage={
                    errorCarga
                        ? 'No se pudieron cargar las instituciones'
                        : 'No hay instituciones para mostrar'
                }
            />
        </div>
    )
}

export default Instituciones
