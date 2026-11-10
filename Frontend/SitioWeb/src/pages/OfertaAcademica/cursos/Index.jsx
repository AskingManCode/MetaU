import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import useCatalogosCurso from '../../../hooks/useCatalogosCurso'
import useCursos from '../../../hooks/useCursos'
import cursoModuleServices from '../../../services/cursoModuleServices'
import { mensajeErrorCurso, normalizarCurso } from '../../../utils/cursoUtils'

const mensajeRelacionCursos =
    'No se puede eliminar el curso porque tiene grupos asociados.'
const mensajeConfirmacion =
    '¿Realmente desea eliminar el elemento seleccionado?'

const obtenerGrupos = async () => {
    const { data } = await cursoModuleServices.getGrupos()

    if (Array.isArray(data)) {
        return data
    }

    if (!Array.isArray(data?.datos)) {
        throw new Error('La respuesta de grupos no es válida.')
    }

    const grupos = [...data.datos]
    const totalPaginas = Number(data.totalPaginas)

    if (Number.isInteger(totalPaginas) && totalPaginas > 1) {
        for (let pagina = 2; pagina <= totalPaginas; pagina += 1) {
            const { data: siguiente } = await cursoModuleServices.getGrupos(pagina)
            if (Array.isArray(siguiente)) {
                grupos.push(...siguiente)
            } else if (Array.isArray(siguiente?.datos)) {
                grupos.push(...siguiente.datos)
            } else {
                throw new Error('La respuesta paginada de grupos no es válida.')
            }
        }
    }

    return grupos
}

function Cursos() {
    const navigate = useNavigate()
    const location = useLocation()
    const [carreraSeleccionada, setCarreraSeleccionada] = useState('')
    const [nivel, setNivel] = useState('')
    const [notification, setNotification] = useState(() => (
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    ))
    const [eliminandoCode, setEliminandoCode] = useState('')
    const { carreras, error: errorCarreras, loading: cargandoCarreras } =
        useCatalogosCurso()
    const carreraNombrePorCodigo = useMemo(
        () => new Map(carreras.map(carrera => [carrera.carreraCode, carrera.nombre])),
        [carreras]
    )
    const {
        cursos,
        pagina,
        setPagina,
        tamanoPagina,
        totalRegistros,
        totalPaginas,
        paginacionCliente,
        loading,
        errorCarga,
        recargar
    } = useCursos({
        carreraCode: carreraSeleccionada,
        nivel,
        mostrarUltimaPaginaInicial: Boolean(location.state?.mostrarUltimaPagina)
    })
    const filas = paginacionCliente
        ? cursos.slice((pagina - 1) * tamanoPagina, pagina * tamanoPagina)
        : cursos

    useEffect(() => {
        if (location.state) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    const filtrarPorCarrera = evento => {
        setPagina(1)
        setCarreraSeleccionada(evento.target.value)
    }

    const confirmarEliminacion = curso => {
        setNotification({
            type: 'warning',
            message: mensajeConfirmacion,
            onCancel: () => setNotification(null),
            onConfirm: () => {
                setNotification(null)
                return eliminarCurso(curso)
            }
        })
    }

    const eliminarCurso = async curso => {
        if (eliminandoCode) return

        setEliminandoCode(curso.cursoCode)

        try {
            const grupos = await obtenerGrupos()
            const asociado = grupos.some(grupo =>
                normalizarCurso(grupo).cursoCode === curso.cursoCode
            )

            if (asociado) {
                setNotification({ type: 'error', message: mensajeRelacionCursos })
                return
            }

            await cursoModuleServices.eliminarCurso(curso.cursoCode)
            setNotification({
                type: 'success',
                message: 'Curso eliminado correctamente.'
            })
            recargar()
        } catch (error) {
            const mensaje = error?.response
                ? mensajeErrorCurso(error, 'No se pudo eliminar el curso.')
                : error?.message?.startsWith('La respuesta')
                    ? error.message
                    : mensajeErrorCurso(error, 'No se pudo eliminar el curso.')
            setNotification({ type: 'error', message: mensaje })
        } finally {
            setEliminandoCode('')
        }
    }

    const cambiarNivel = evento => {
        setPagina(1)
        setNivel(evento.target.value)
    }

    const cambiarPaginaActual = nuevaPagina => {
        setPagina(nuevaPagina)
    }

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={Boolean(notification)}
                onClose={() => setNotification(null)}
                onConfirm={notification?.onConfirm}
                onCancel={notification?.onCancel}
            />

            <MaintenanceHeader
                title="Mantenimiento de Cursos"
                buttonLabel="Nuevo Curso"
                onButtonClick={() => navigate('/cursos/nuevo')}
            />

            {errorCarreras && (
                <Alert variant="danger">
                    No se pudieron cargar las carreras: {errorCarreras}
                </Alert>
            )}
            {errorCarga && <Alert variant="danger">{errorCarga}</Alert>}

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <Form.Label htmlFor="filtroCarrera">Carrera</Form.Label>
                            <Form.Select
                                id="filtroCarrera"
                                value={carreraSeleccionada}
                                onChange={filtrarPorCarrera}
                                disabled={cargandoCarreras}
                            >
                                <option value="">Todas</option>
                                {carreras.map(carrera => (
                                    <option
                                        key={carrera.carreraCode}
                                        value={carrera.carreraCode}
                                    >
                                        {carrera.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        <div className="col-md-6">
                            <Form.Label htmlFor="filtroNivel">Nivel</Form.Label>
                            <Form.Select
                                id="filtroNivel"
                                value={nivel}
                                onChange={cambiarNivel}
                            >
                                <option value="">Todos</option>
                                {Array.from({ length: 12 }, (_, indice) => indice + 1)
                                    .map(numero => (
                                        <option key={numero} value={numero}>
                                            {numero}
                                        </option>
                                    ))}
                            </Form.Select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <Table striped hover className="align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Carrera</th>
                                    <th>Nivel</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4">
                                            <Spinner size="sm" className="me-2" />
                                            Cargando cursos...
                                        </td>
                                    </tr>
                                ) : filas.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">
                                            No hay cursos para mostrar.
                                        </td>
                                    </tr>
                                ) : filas.map(curso => (
                                    <tr key={curso.cursoCode}>
                                        <td>{curso.cursoCode}</td>
                                        <td>{curso.nombre}</td>
                                        <td>
                                            {carreraNombrePorCodigo.get(curso.carreraCode) ||
                                                curso.carreraCode}
                                        </td>
                                        <td>{curso.nivel}</td>
                                        <td className="text-end text-nowrap">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() => navigate(
                                                    `/cursos/editar/${encodeURIComponent(curso.cursoCode)}`
                                                )}
                                                disabled={Boolean(eliminandoCode)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => confirmarEliminacion(curso)}
                                                disabled={Boolean(eliminandoCode)}
                                            >
                                                {eliminandoCode === curso.cursoCode
                                                    ? 'Eliminando...'
                                                    : 'Eliminar'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                        <small className="text-muted">
                            {totalRegistros} registros · página {pagina} de {totalPaginas}
                        </small>
                        <div className="d-flex gap-2">
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                disabled={loading || pagina <= 1}
                                onClick={() => cambiarPaginaActual(pagina - 1)}
                            >
                                Anterior
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                disabled={loading || pagina >= totalPaginas}
                                onClick={() => cambiarPaginaActual(pagina + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cursos