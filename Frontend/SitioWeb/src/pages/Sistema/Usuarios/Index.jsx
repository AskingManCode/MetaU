import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useUsuarios from '../../../hooks/useUsuarios'
import rolService from '../../../services/rolService'
import { mensajeError, normalizarRol } from '../../../utils/sistemaUtils'
import { DOMINIOS, TIPOS_IDENTIFICACION, nombreTipo } from '../../../utils/usuarioUtils'

const FILTROS_VACIOS = { identificacion: '', nombre: '', tipo: '', dominio: '', rol: '' }

function Usuarios() {
    const navigate = useNavigate()
    const location = useLocation()

    const [borrador, setBorrador] = useState(FILTROS_VACIOS)
    const [filtros, setFiltros] = useState(FILTROS_VACIOS)
    const [orden, setOrden] = useState({ key: null, direction: 'asc' })
    const [roles, setRoles] = useState([])
    const [eliminando, setEliminando] = useState(false)

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
    } = useUsuarios({ filtros, orden })

    useEffect(() => {
        if (location.state?.mensaje) {
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.pathname, location.state, navigate])

    useEffect(() => {
        if (errorCarga) setNotification({ type: 'error', message: errorCarga })
    }, [errorCarga])

    useEffect(() => {
        let activo = true

        rolService.getAll()
            .then(({ data }) => {
                if (activo && Array.isArray(data)) setRoles(data.map(normalizarRol))
            })
            .catch(() => {
                if (activo) setRoles([])
            })

        return () => { activo = false }
    }, [])

    const nombresRol = useMemo(
        () => Object.fromEntries(roles.map(r => [r.idRol, r.nombre])),
        [roles]
    )

    const cambiarBorrador = (campo, valor) => {
        setBorrador(actual => ({ ...actual, [campo]: valor }))
    }

    const aplicarFiltros = e => {
        e.preventDefault()
        setFiltros(borrador)
        setPagina(1)
    }

    const limpiarFiltros = () => {
        setBorrador(FILTROS_VACIOS)
        setFiltros(FILTROS_VACIOS)
        setPagina(1)
    }

    const cambiarOrden = nuevoOrden => {
        setOrden(nuevoOrden)
        setPagina(1)
    }

    const confirmarEliminacion = usuario => {
        setNotification({
            type: 'warning',
            message: '¿Realmente desea eliminar el elemento seleccionado?',
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                if (eliminando) return

                setEliminando(true)
                setNotification(null)

                try {
                    await eliminar(usuario.email)
                    setNotification({ type: 'success', message: 'Usuario eliminado correctamente' })
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(error, 'No se pudo eliminar el usuario')
                    })
                } finally {
                    setEliminando(false)
                }
            }
        })
    }

    const columnas = [
        { key: 'email', label: 'Email (ID)', sortable: true },
        {
            key: 'tipo',
            label: 'Tipo de identificacion',
            sortable: true,
            render: u => nombreTipo(u.tipoIdentificacion)
        },
        { key: 'identificacion', label: 'Identificacion', sortable: true },
        { key: 'nombre', label: 'Nombre', sortable: true },
        {
            key: 'rol',
            label: 'Rol',
            sortable: true,
            render: u => nombresRol[u.idRol] ?? u.idRol
        }
    ]

    const acciones = [
        {
            type: 'ver',
            onClick: usuario => navigate(`/usuarios/ver/${encodeURIComponent(usuario.email)}`)
        },
        {
            type: 'editar',
            onClick: usuario => navigate(`/usuarios/editar/${encodeURIComponent(usuario.email)}`)
        },
        {
            type: 'eliminar',
            onClick: confirmarEliminacion,
            disabled: eliminando
        }
    ]

    const formularioFiltros = (
        <Form onSubmit={aplicarFiltros}>
            <div className="row g-2">
                <div className="col-md-4">
                    <Form.Label className="small mb-1">Identificacion</Form.Label>
                    <Form.Control
                        size="sm"
                        placeholder="Numero de identificacion"
                        value={borrador.identificacion}
                        onChange={e => cambiarBorrador('identificacion', e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <Form.Label className="small mb-1">Nombre</Form.Label>
                    <Form.Control
                        size="sm"
                        placeholder="Buscar nombre"
                        value={borrador.nombre}
                        onChange={e => cambiarBorrador('nombre', e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <Form.Label className="small mb-1">Tipo de identificacion</Form.Label>
                    <Form.Select
                        size="sm"
                        value={borrador.tipo}
                        onChange={e => cambiarBorrador('tipo', e.target.value)}
                    >
                        <option value="">Todos</option>
                        {TIPOS_IDENTIFICACION.map(t => (
                            <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-4">
                    <Form.Label className="small mb-1">Dominio</Form.Label>
                    <Form.Select
                        size="sm"
                        value={borrador.dominio}
                        onChange={e => cambiarBorrador('dominio', e.target.value)}
                    >
                        <option value="">Todos</option>
                        {DOMINIOS.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-4">
                    <Form.Label className="small mb-1">Rol</Form.Label>
                    <Form.Select
                        size="sm"
                        value={borrador.rol}
                        onChange={e => cambiarBorrador('rol', e.target.value)}
                    >
                        <option value="">Todos</option>
                        {roles.map(r => (
                            <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-4 d-flex align-items-end gap-2">
                    <button type="submit" className="btn btn-sm btn-primary flex-fill">
                        <i className="bi bi-search me-2" />
                        Filtrar
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary flex-fill"
                        onClick={limpiarFiltros}
                    >
                        <i className="bi bi-arrow-counterclockwise me-2" />
                        Limpiar
                    </button>
                </div>
            </div>
        </Form>
    )

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
                title="Mantenimiento de Usuarios"
                buttonLabel="Nuevo Usuario"
                onButtonClick={() => navigate('/usuarios/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={registros}
                actions={acciones}
                rowKey="email"
                loading={loading}
                filters={formularioFiltros}
                pageSize={15}
                serverPagination
                currentPage={pagina}
                totalPages={totalPaginas}
                totalRecords={totalRegistros}
                onPageChange={setPagina}
                onSortChange={cambiarOrden}
                emptyMessage={
                    errorCarga
                        ? 'No se pudieron cargar los usuarios'
                        : 'No hay usuarios para mostrar'
                }
            />
        </div>
    )
}

export default Usuarios