import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import useCatalogosCarrera from '../../../hooks/useCatalogosCarrera'
import useCarreras from '../../../hooks/useCarreras'
import carreraService from '../../../services/carreraService'
import cursoService from '../../../services/cursoService'
import { mensajeErrorCarrera } from '../../../utils/carreraUtils'

const MENSAJE_CONFIRMAR_ELIMINACION =
    '¿Realmente desea eliminar el elemento seleccionado?'

function Carreras() {
    const navigate = useNavigate()
    const location = useLocation()
    const [institucionFiltro, setInstitucionFiltro] = useState('')
    const [pagina, setPagina] = useState(1)
    const [dismissedError, setDismissedError] = useState(null)
    const [carreraDestacada, setCarreraDestacada] = useState(
        location.state?.carreraCode ?? null
    )
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )
    const [verificandoCarrera, setVerificandoCarrera] = useState(null)
    const [eliminando, setEliminando] = useState(false)

    const {
        instituciones,
        profesores,
        loading: cargandoCatalogos,
        error: errorCatalogos
    } = useCatalogosCarrera()
    const {
        carreras,
        pageSize,
        loading,
        error,
        errorConfiguracion,
        recargar
    } = useCarreras()

    useEffect(() => {
        if (location.state?.mensaje || location.state?.carreraCode) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    const nombresInstituciones = useMemo(() => new Map(
        instituciones.map(institucion => [
            institucion.institucionCode,
            institucion.nombre
        ])
    ), [instituciones])
    const nombresProfesores = useMemo(() => new Map(
        profesores.map(profesor => [
            String(profesor.profesorID).toLowerCase(),
            profesor.nombreCompleto || profesor.profesorID
        ])
    ), [profesores])

    const carrerasFiltradas = useMemo(
        () => carreras.filter(carrera =>
            !institucionFiltro ||
            carrera.institucionCode === institucionFiltro
        ),
        [carreras, institucionFiltro]
    )
    const indiceDestacado = loading || !carreraDestacada
        ? -1
        : carrerasFiltradas.findIndex(carrera =>
            carrera.carreraCode === carreraDestacada
        )
    const totalPaginas = Math.max(
        1,
        Math.ceil(carrerasFiltradas.length / pageSize)
    )
    const paginaActual = indiceDestacado >= 0
        ? Math.floor(indiceDestacado / pageSize) + 1
        : Math.min(pagina, totalPaginas)

    const errorFuente = error || errorCatalogos || errorConfiguracion
    const errorVisible = errorFuente && errorFuente !== dismissedError
    const notificacionVisible = notification || (errorVisible
        ? { type: 'error', message: errorFuente }
        : null)

    const cerrarNotificacion = () => {
        if (!notification && errorVisible) {
            setDismissedError(errorFuente)
            return
        }
        setNotification(null)
    }

    const cambiarInstitucion = event => {
        setInstitucionFiltro(event.target.value)
        setPagina(1)
        setCarreraDestacada(null)
    }

    const eliminarCarrera = async carrera => {
        if (eliminando) return

        setEliminando(true)
        setNotification(null)

        try {
            await carreraService.delete(carrera.carreraCode)
            setNotification({
                type: 'success',
                message: 'Carrera eliminada correctamente.'
            })
            setCarreraDestacada(null)
            recargar()
        } catch (errorEliminacion) {
            setNotification({
                type: 'error',
                message: mensajeErrorCarrera(
                    errorEliminacion,
                    'No se pudo eliminar la carrera.'
                )
            })
        } finally {
            setEliminando(false)
        }
    }

    const confirmarEliminacion = carrera => {
        setNotification({
            type: 'warning',
            message: MENSAJE_CONFIRMAR_ELIMINACION,
            onCancel: cerrarNotificacion,
            onConfirm: () => eliminarCarrera(carrera)
        })
    }

    const verificarCursosYConfirmar = async carrera => {
        if (verificandoCarrera || eliminando) return

        setVerificandoCarrera(carrera.carreraCode)
        setNotification(null)

        try {
            const { data } = await cursoService.getByCarrera(carrera.carreraCode)
            const cursos = Array.isArray(data) ? data : data?.datos

            if (!Array.isArray(cursos)) {
                throw new Error(
                    'No se pudo verificar si la carrera tiene cursos vinculados.'
                )
            }

            if (cursos.length > 0) {
                setNotification({
                    type: 'error',
                    message: 'No se puede eliminar la carrera porque tiene cursos vinculados.'
                })
                return
            }

            confirmarEliminacion(carrera)
        } catch (errorVerificacion) {
            setNotification({
                type: 'error',
                message: mensajeErrorCarrera(
                    errorVerificacion,
                    errorVerificacion?.message?.startsWith('No se pudo verificar')
                        ? errorVerificacion.message
                        : 'No se pudo verificar si la carrera tiene cursos vinculados.'
                )
            })
        } finally {
            setVerificandoCarrera(null)
        }
    }

    const columnas = useMemo(() => [
        { key: 'carreraCode', label: 'Código', sortable: true },
        { key: 'nombre', label: 'Nombre', sortable: true },
        {
            key: 'institucionCode',
            label: 'Institución',
            sortable: true,
            render: carrera =>
                nombresInstituciones.get(carrera.institucionCode) ??
                carrera.institucionCode,
            sortValue: carrera =>
                nombresInstituciones.get(carrera.institucionCode) ??
                carrera.institucionCode
        },
        {
            key: 'directorID',
            label: 'Director',
            sortable: true,
            render: carrera =>
                nombresProfesores.get(String(carrera.directorID).toLowerCase()) ??
                carrera.directorID,
            sortValue: carrera =>
                nombresProfesores.get(String(carrera.directorID).toLowerCase()) ??
                carrera.directorID
        }
    ], [nombresInstituciones, nombresProfesores])

    const acciones = [
        {
            type: 'editar',
            onClick: carrera => navigate(
                `/carreras/editar/${encodeURIComponent(carrera.carreraCode)}`
            ),
            disabled: !!verificandoCarrera || eliminando
        },
        {
            type: 'eliminar',
            onClick: verificarCursosYConfirmar,
            disabled: !!verificandoCarrera || eliminando
        }
    ]

    const filtros = (
        <div className="row g-2">
            <div className="col-md-6">
                <Form.Label
                    className="small mb-1"
                    htmlFor="filtroInstitucion"
                >
                    Institución
                </Form.Label>
                <Form.Select
                    id="filtroInstitucion"
                    size="sm"
                    value={institucionFiltro}
                    onChange={cambiarInstitucion}
                    disabled={cargandoCatalogos}
                >
                    <option value="">Todas</option>
                    {instituciones.map(institucion => (
                        <option
                            key={institucion.institucionCode}
                            value={institucion.institucionCode}
                        >
                            {institucion.nombre}
                        </option>
                    ))}
                </Form.Select>
            </div>
        </div>
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
                title="Mantenimiento de Carreras"
                buttonLabel="Nueva Carrera"
                onButtonClick={() => navigate('/carreras/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={carrerasFiltradas}
                actions={acciones}
                rowKey="carreraCode"
                loading={loading || cargandoCatalogos}
                filters={filtros}
                pageSize={pageSize}
                currentPage={paginaActual}
                onPageChange={nuevaPagina => {
                    setPagina(nuevaPagina)
                    setCarreraDestacada(null)
                }}
                emptyMessage={
                    error
                        ? 'No se pudieron cargar las carreras'
                        : 'No hay carreras para mostrar'
                }
            />
        </div>
    )
}

export default Carreras