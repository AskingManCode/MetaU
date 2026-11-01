import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import useCarreras from '../../../hooks/useCarreras'
import useCatalogosCarrera from '../../../hooks/useCatalogosCarrera'
import cursoService from '../../../services/cursoService'
import carreraService from '../../../services/carreraService'
import { mensajeErrorCarrera } from '../../../utils/carreraUtils'

function Carreras() {
    const navigate = useNavigate()
    const location = useLocation()
    const [institucionFiltro, setInstitucionFiltro] = useState('')
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )
    const [carreraEliminar, setCarreraEliminar] = useState(null)
    const [eliminando, setEliminando] = useState(false)
    const {
        instituciones,
        profesores,
        loading: cargandoCatalogos,
        error: errorCatalogos
    } = useCatalogosCarrera()
    const {
        carreras,
        pagina,
        setPagina,
        tamanoPagina,
        totalRegistros,
        totalPaginas,
        paginacionCliente,
        loading,
        errorCarga,
        recargar
    } = useCarreras({
        institucionCode: institucionFiltro,
        mostrarUltimaPaginaInicial: Boolean(
            location.state?.mostrarUltimaPagina
        )
    })

    useEffect(() => {
        if (location.state?.mensaje || location.state?.mostrarUltimaPagina) {
            navigate(location.pathname, {
                replace: true,
                state: null
            })
        }
    }, [location.pathname, location.state, navigate])

    const nombresInstituciones = useMemo(() => new Map(
        instituciones.map(institucion => [
            institucion.institucionCode,
            institucion.nombre
        ])
    ), [instituciones])

    const nombresDirectores = useMemo(() => new Map(
        profesores.map(profesor => [
            String(profesor.profesorID).toLowerCase(),
            profesor.nombreCompleto || profesor.profesorID
        ])
    ), [profesores])

    const carrerasVisibles = useMemo(() => {
        if (!paginacionCliente) return carreras

        const inicio = (pagina - 1) * tamanoPagina
        return carreras.slice(inicio, inicio + tamanoPagina)
    }, [carreras, pagina, paginacionCliente, tamanoPagina])

    const cambiarInstitucion = event => {
        setInstitucionFiltro(event.target.value)
        setPagina(1)
    }

    const confirmarEliminacion = async () => {
        if (!carreraEliminar || eliminando) return

        setEliminando(true)

        try {
            const respuesta = await cursoService.getByCarrera(
                encodeURIComponent(carreraEliminar.carreraCode)
            )
            const cursos = Array.isArray(respuesta.data)
                ? respuesta.data
                : respuesta.data?.datos

            if (!Array.isArray(cursos)) {
                setCarreraEliminar(null)
                setNotification({
                    type: 'error',
                    message: 'No se pudo verificar si la carrera tiene cursos vinculados.'
                })
                return
            }

            if (cursos.length > 0) {
                setCarreraEliminar(null)
                setNotification({
                    type: 'error',
                    message: 'No se puede eliminar la carrera porque tiene cursos vinculados.'
                })
                return
            }

            await carreraService.delete(carreraEliminar.carreraCode)

            setCarreraEliminar(null)
            setNotification({
                type: 'success',
                message: 'Carrera eliminada correctamente.'
            })
            recargar()
        } catch (error) {
            setCarreraEliminar(null)
            setNotification({
                type: 'error',
                message: mensajeErrorCarrera(
                    error,
                    'No se pudo eliminar la carrera.'
                )
            })
        } finally {
            setEliminando(false)
        }
    }

    const actualizarPagina = nuevaPagina => {
        setPagina(Math.max(1, Math.min(nuevaPagina, totalPaginas)))
    }

    return (
        <div>
            <Notification
                type={
                    errorCarga || errorCatalogos
                        ? 'error'
                        : notification?.type
                }
                message={
                    errorCarga ||
                    errorCatalogos ||
                    notification?.message
                }
                show={!!errorCarga || !!errorCatalogos || !!notification}
                onClose={() => setNotification(null)}
            />

            <MaintenanceHeader
                title="Mantenimiento de Carreras"
                buttonLabel="Nuevo"
                onButtonClick={() => navigate('/carreras/nuevo')}
            />

            <div className="card border-0 shadow-sm mt-3">
                <div className="card-body">
                    <Form.Group controlId="filtroInstitucion">
                        <Form.Label className="small mb-1">
                            Filtrar por institución
                        </Form.Label>
                        <Form.Select
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
                                    {institucion.nombre
                                        ? `${institucion.nombre} (${institucion.institucionCode})`
                                        : institucion.institucionCode}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            <div className="card border-0 shadow-sm mt-3">
                <div className="card-header bg-light text-primary fw-semibold">
                    Carreras
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Código</th>
                                    <th scope="col">Nombre</th>
                                    <th scope="col">Institución</th>
                                    <th scope="col">Director</th>
                                    <th scope="col" className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading || cargandoCatalogos ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <Spinner animation="border" size="sm" />
                                        </td>
                                    </tr>
                                ) : errorCarga || errorCatalogos ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            No se pudieron cargar las carreras.
                                        </td>
                                    </tr>
                                ) : carrerasVisibles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            No hay carreras para mostrar.
                                        </td>
                                    </tr>
                                ) : carrerasVisibles.map(carrera => (
                                    <tr key={carrera.carreraCode}>
                                        <td>{carrera.carreraCode}</td>
                                        <td>{carrera.nombre}</td>
                                        <td>
                                            {nombresInstituciones.get(carrera.institucionCode) ||
                                                carrera.institucionCode}
                                        </td>
                                        <td>
                                            {nombresDirectores.get(
                                                String(carrera.directorID).toLowerCase()
                                            ) || carrera.directorID}
                                        </td>
                                        <td className="text-end text-nowrap">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() => navigate(
                                                    `/carreras/editar/${encodeURIComponent(carrera.carreraCode)}`
                                                )}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => setCarreraEliminar(carrera)}
                                                disabled={eliminando}
                                            >
                                                Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!loading && !errorCarga && !errorCatalogos && (
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                            <small className="text-muted">
                                {totalRegistros} carreras
                            </small>
                            {totalPaginas > 1 && (
                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        disabled={pagina <= 1}
                                        onClick={() => actualizarPagina(pagina - 1)}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="small">
                                        Página {pagina} de {totalPaginas}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        disabled={pagina >= totalPaginas}
                                        onClick={() => actualizarPagina(pagina + 1)}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                show={!!carreraEliminar}
                onHide={() => !eliminando && setCarreraEliminar(null)}
                centered
                backdrop={eliminando ? 'static' : true}
            >
                <Modal.Header closeButton={!eliminando}>
                    <Modal.Title className="fs-5">
                        Confirmar eliminación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Realmente desea eliminar el elemento seleccionado?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setCarreraEliminar(null)}
                        disabled={eliminando}
                    >
                        No
                    </Button>
                    <Button
                        variant="primary"
                        onClick={confirmarEliminacion}
                        disabled={eliminando}
                    >
                        {eliminando ? 'Verificando...' : 'Sí'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Carreras