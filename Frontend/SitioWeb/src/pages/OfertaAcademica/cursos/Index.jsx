import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import useCarrerasCurso from '../../../hooks/useCarrerasCurso'
import useCursos from '../../../hooks/useCursos'
import cursoService from '../../../services/cursoService'
import grupoService from '../../../services/grupoService'
import { mensajeErrorCurso, normalizarCurso } from '../../../utils/cursoUtils'

const mensajeRelacionCursos =
    'No se puede eliminar el curso porque tiene grupos asociados.'

function Cursos() {
    const navigate = useNavigate()
    const location = useLocation()
    const [carreraCode, setCarreraCode] = useState('')
    const [nivel, setNivel] = useState('')
    const [pagina, setPagina] = useState(1)
    const [eliminando, setEliminando] = useState(false)
    const [dismissedError, setDismissedError] = useState(null)
    const [cursoDestacado, setCursoDestacado] = useState(
        location.state?.cursoCode ?? null
    )
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )

    const {
        carreras,
        loading: cargandoCarreras,
        error: errorCarreras
    } = useCarrerasCurso()
    const {
        cursos,
        pageSize,
        loading,
        error: errorCarga,
        errorConfiguracion,
        recargar
    } = useCursos()

    const carrerasPorCodigo = useMemo(
        () => new Map(carreras.map(carrera => [carrera.carreraCode, carrera.nombre])),
        [carreras]
    )

    useEffect(() => {
        if (location.state?.mensaje || location.state?.cursoCode) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    const filtrados = useMemo(() => cursos.filter(curso =>
        (!carreraCode || curso.carreraCode === carreraCode) &&
        (!nivel || Number(curso.nivel) === Number(nivel))
    ), [cursos, carreraCode, nivel])

    const indiceDestacado = loading || !cursoDestacado
        ? -1
        : filtrados.findIndex(curso => curso.cursoCode === cursoDestacado)
    const paginaActual = indiceDestacado >= 0
        ? Math.floor(indiceDestacado / pageSize) + 1
        : pagina

    const errorFuente = errorCarga || errorCarreras || errorConfiguracion
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

    const confirmarEliminacion = curso => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar el elemento seleccionado?',
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                if (eliminando) return

                setEliminando(true)
                setNotification(null)

                try {
                    const { data } = await grupoService.getAll()
                    const grupos = Array.isArray(data) ? data : data?.datos

                    if (!Array.isArray(grupos)) {
                        throw new Error('No se pudo verificar si el curso tiene grupos asociados.')
                    }

                    const tieneGrupos = grupos.some(grupo =>
                        normalizarCurso(grupo).cursoCode.toUpperCase() ===
                        curso.cursoCode.toUpperCase()
                    )

                    if (tieneGrupos) {
                        setNotification({ type: 'error', message: mensajeRelacionCursos })
                        return
                    }

                    await cursoService.delete(curso.cursoCode)
                    setNotification({
                        type: 'success',
                        message: 'Curso eliminado correctamente'
                    })
                    recargar()
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: mensajeErrorCurso(
                            error,
                            error?.response
                                ? 'No se pudo eliminar el curso.'
                                : 'No se pudo verificar si el curso tiene grupos asociados.'
                        )
                    })
                } finally {
                    setEliminando(false)
                }
            }
        })
    }

    const columnas = useMemo(() => [
        { key: 'cursoCode', label: 'Código', sortable: true },
        {
            key: 'carreraCode',
            label: 'Carrera',
            sortable: true,
            render: curso => carrerasPorCodigo.get(curso.carreraCode) ?? curso.carreraCode
        },
        { key: 'nivel', label: 'Nivel', sortable: true },
        { key: 'nombre', label: 'Nombre', sortable: true }
    ], [carrerasPorCodigo])

    const acciones = [
        {
            type: 'editar',
            onClick: curso => navigate(
                `/cursos/editar/${encodeURIComponent(curso.cursoCode)}`
            ),
            disabled: eliminando
        },
        {
            type: 'eliminar',
            onClick: confirmarEliminacion,
            disabled: eliminando
        }
    ]

    const filtros = (
        <div className="row g-2">
            <div className="col-md-6">
                <Form.Label className="small mb-1">Carrera</Form.Label>
                <Form.Select
                    size="sm"
                    value={carreraCode}
                    onChange={event => {
                        setCarreraCode(event.target.value)
                        setPagina(1)
                        setCursoDestacado(null)
                    }}
                    disabled={cargandoCarreras}
                >
                    <option value="">Todas</option>
                    {carreras.map(carrera => (
                        <option key={carrera.carreraCode} value={carrera.carreraCode}>
                            {carrera.nombre}
                        </option>
                    ))}
                </Form.Select>
            </div>
            <div className="col-md-6">
                <Form.Label className="small mb-1">Nivel</Form.Label>
                <Form.Select
                    size="sm"
                    value={nivel}
                    onChange={event => {
                        setNivel(event.target.value)
                        setPagina(1)
                        setCursoDestacado(null)
                    }}
                >
                    <option value="">Todos</option>
                    {Array.from({ length: 12 }, (_, index) => index + 1).map(value => (
                        <option key={value} value={value}>{value}</option>
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
                title="Mantenimiento de Cursos"
                buttonLabel="Nuevo Curso"
                onButtonClick={() => navigate('/cursos/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtrados}
                actions={acciones}
                rowKey="cursoCode"
                loading={loading || cargandoCarreras}
                filters={filtros}
                pageSize={pageSize}
                currentPage={paginaActual}
                onPageChange={nuevaPagina => {
                    setPagina(nuevaPagina)
                    setCursoDestacado(null)
                }}
                emptyMessage={
                    errorCarga
                        ? 'No se pudieron cargar los cursos'
                        : 'No hay cursos para mostrar'
                }
            />
        </div>
    )
}

export default Cursos