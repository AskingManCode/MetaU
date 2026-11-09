import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import useInstituciones from '../../../hooks/useInstituciones'
import carreraService from '../../../services/carreraService'
import institucionService from '../../../services/institucionService'
import {
    mensajeErrorInstitucion,
    textoInstitucion
} from '../../../utils/institucionUtils'

const columnas = [
    { key: 'institucionCode', label: 'Código' },
    { key: 'nombre', label: 'Nombre' }
]

function Instituciones() {
    const navigate = useNavigate()
    const location = useLocation()
    const [busqueda, setBusqueda] = useState('')
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null
    )
    const [institucionEliminar, setInstitucionEliminar] = useState(null)
    const [eliminando, setEliminando] = useState(false)
    const listaCompleta = Boolean(busqueda.trim())

    const {
        instituciones,
        pagina,
        setPagina,
        tamanoPagina,
        totalRegistros,
        totalPaginas,
        paginacionCliente,
        loading,
        errorCarga,
        recargar
    } = useInstituciones({
        listaCompleta,
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

    const filtradas = useMemo(() => {
        const termino = textoInstitucion(busqueda.trim())

        if (!termino) {
            return instituciones
        }

        return instituciones.filter(institucion =>
            textoInstitucion(institucion.nombre).includes(termino)
        )
    }, [instituciones, busqueda])

    const acciones = useMemo(() => [
        {
            type: 'editar',
            onClick: institucion => navigate(
                `/instituciones/editar/${encodeURIComponent(institucion.institucionCode)}`
            )
        },
        {
            type: 'eliminar',
            onClick: setInstitucionEliminar,
            disabled: eliminando
        }
    ], [eliminando, navigate])

    const confirmarEliminacion = async () => {
        if (!institucionEliminar || eliminando) return

        setEliminando(true)

        try {
            let respuestaCarreras

            try {
                respuestaCarreras = await carreraService.getByInstitucion(
                    institucionEliminar.institucionCode
                )
            } catch (error) {
                setInstitucionEliminar(null)
                setNotification({
                    type: 'error',
                    message: mensajeErrorInstitucion(
                        error,
                        'No se pudo verificar si la institución tiene carreras asociadas.'
                    )
                })
                return
            }

            const carreras = Array.isArray(respuestaCarreras.data)
                ? respuestaCarreras.data
                : respuestaCarreras.data?.datos

            if (!Array.isArray(carreras)) {
                setInstitucionEliminar(null)
                setNotification({
                    type: 'error',
                    message: 'No se pudo verificar si la institución tiene carreras asociadas.'
                })
                return
            }

            if (carreras.length > 0) {
                setInstitucionEliminar(null)
                setNotification({
                    type: 'error',
                    message: 'No se puede eliminar la institución porque tiene carreras asociadas.'
                })
                return
            }

            await institucionService.delete(
                institucionEliminar.institucionCode
            )

            setInstitucionEliminar(null)
            setNotification({
                type: 'success',
                message: 'Institución eliminada correctamente.'
            })
            recargar()
        } catch (error) {
            setInstitucionEliminar(null)
            setNotification({
                type: 'error',
                message: mensajeErrorInstitucion(
                    error,
                    'No se pudo eliminar la institución.'
                )
            })
        } finally {
            setEliminando(false)
        }
    }

    const filtros = (
        <Form.Group controlId="buscarInstitucion">
            <Form.Label className="small mb-1">Buscar por nombre</Form.Label>
            <Form.Control
                size="sm"
                type="search"
                placeholder="Nombre de la institución"
                value={busqueda}
                onChange={event => {
                    setBusqueda(event.target.value)
                    setPagina(1)
                }}
            />
        </Form.Group>
    )

    return (
        <div>
            <Notification
                type={errorCarga ? 'error' : notification?.type}
                message={errorCarga || notification?.message}
                show={!!errorCarga || !!notification}
                onClose={() => setNotification(null)}
            />

            <MaintenanceHeader
                title="Mantenimiento de Instituciones"
                buttonLabel="Nuevo"
                onButtonClick={() => navigate('/instituciones/nuevo')}
            />

            <DataTable
                title="Instituciones"
                columns={columnas}
                data={filtradas}
                actions={acciones}
                rowKey="institucionCode"
                loading={loading}
                filters={filtros}
                pageSize={tamanoPagina}
                serverPagination={!listaCompleta && !paginacionCliente}
                currentPage={pagina}
                totalPages={totalPaginas}
                totalRecords={totalRegistros}
                onPageChange={setPagina}
                emptyMessage={errorCarga || 'No hay instituciones para mostrar.'}
            />

            <Modal
                show={!!institucionEliminar}
                onHide={() => !eliminando && setInstitucionEliminar(null)}
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
                        onClick={() => setInstitucionEliminar(null)}
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

export default Instituciones