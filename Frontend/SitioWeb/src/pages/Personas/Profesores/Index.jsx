
import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useProfesores from '../../../hooks/useProfesores'
import { mensajeError, textoBusqueda } from '../../../utils/profesorUtils'

const columnas = [
    { key: 'tipoIdentificacionCode', label: 'Tipo identificacion', sortable: true },
    { key: 'identificacion', label: 'Identificacion', sortable: true },
    { key: 'nombreCompleto', label: 'Nombre completo', sortable: true },
    { key: 'email', label: 'Correo electronico', sortable: true },
    { key: 'fechaNacimiento', label: 'Fecha nacimiento', sortable: true },
    { key: 'telefonos', label: 'Telefonos', render: p => p.telefonos.join(', ') },
    { key: 'estado', label: 'Estado', sortable: true, render: p => p.estado ? 'Activo' : 'Inactivo' }
]

function Profesores() {
    const navigate = useNavigate()
    const location = useLocation()
    const { profesores, loading, errorCarga, eliminarProfesor } = useProfesores()

    const [notification, setNotification] = useState(
        location.state?.mensaje ? { type: 'success', message: location.state.mensaje } : null
    )
    const [identificacion, setIdentificacion] = useState('')
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [eliminando, setEliminando] = useState(false)

    useEffect(() => {
        if (location.state?.mensaje)
            navigate(location.pathname, { replace: true, state: null })
    }, [location.pathname, location.state, navigate])

    useEffect(() => {
        if (errorCarga) setNotification({ type: 'error', message: errorCarga })
    }, [errorCarga])

    const filtrados = useMemo(() => profesores.filter(p =>
        textoBusqueda(p.identificacion).includes(textoBusqueda(identificacion)) &&
        textoBusqueda(p.nombreCompleto).includes(textoBusqueda(nombre)) &&
        textoBusqueda(p.email).includes(textoBusqueda(correo))
    ), [profesores, identificacion, nombre, correo])

    const confirmarEliminacion = profesor => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar el elemento seleccionado?',
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                if (eliminando) return

                setEliminando(true)
                setNotification(null)

                try {
                    await eliminarProfesor(profesor.profesorID)
                    setNotification({ type: 'success', message: 'Profesor eliminado correctamente' })
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(error, 'No se pudo eliminar el profesor')
                    })
                } finally {
                    setEliminando(false)
                }
            }
        })
    }

    const limpiarFiltros = () => {
        setIdentificacion('')
        setNombre('')
        setCorreo('')
    }

    const filtros = (
        <div className="row g-2">
            <div className="col-md-3">
                <Form.Label className="small mb-1">Identificacion</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar identificacion"
                    value={identificacion}
                    onChange={e => setIdentificacion(e.target.value)}
                />
            </div>

            <div className="col-md-3">
                <Form.Label className="small mb-1">Nombre</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                />
            </div>

            <div className="col-md-3">
                <Form.Label className="small mb-1">Correo electronico</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar correo"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                />
            </div>

            <div className="col-md-3 d-flex align-items-end">
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
            onClick: profesor => navigate(`/profesores/editar/${profesor.profesorID}`)
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
                title="Mantenimiento de Profesores"
                buttonLabel="Nuevo Profesor"
                onButtonClick={() => navigate('/profesores/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtrados}
                actions={acciones}
                rowKey="profesorID"
                loading={loading}
                filters={filtros}
                pageSize={15}
                emptyMessage={errorCarga ? 'No se pudieron cargar los profesores' : 'No hay profesores para mostrar'}
            />
        </div>
    )
}

export default Profesores
