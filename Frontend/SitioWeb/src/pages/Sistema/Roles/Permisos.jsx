import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import DataTable from '../../../components/DataTable'
import rolService from '../../../services/rolService'
import { mensajeError, normalizarRol } from '../../../utils/sistemaUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

function Permisos() {
    const { rolId } = useParams()
    const navigate = useNavigate()

    const [rol, setRol] = useState(null)
    const [permisos, setPermisos] = useState([])
    const [seleccion, setSeleccion] = useState({})
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        Promise.all([rolService.getById(rolId), rolService.getPermisos(rolId)])
            .then(([respuestaRol, respuestaPermisos]) => {
                if (!activo) return

                const lista = respuestaPermisos.data.map(normalizarModulo)

                setRol(normalizarRol(respuestaRol.data))
                setPermisos(lista)
                setSeleccion(Object.fromEntries(lista.map(m => [m.idModulo, m.estado])))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudieron cargar los permisos del rol'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [rolId])

    const cambios = useMemo(
        () => permisos.filter(m => seleccion[m.idModulo] !== m.estado),
        [permisos, seleccion]
    )

    const alternar = idModulo => {
        setSeleccion(actual => ({ ...actual, [idModulo]: !actual[idModulo] }))
    }

    const guardar = async () => {
        if (guardando) return

        if (cambios.length === 0) {
            setNotification({ type: 'info', message: 'No hay cambios por guardar' })
            return
        }

        setGuardando(true)

        try {
            await rolService.updatePermisos(
                rolId,
                cambios.map(m => ({
                    idModulo: m.idModulo,
                    nombre: m.nombre,
                    estado: seleccion[m.idModulo]
                }))
            )

            navigate('/roles', {
                state: { mensaje: 'Permisos del rol actualizados correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudieron actualizar los permisos')
            })
        } finally {
            setGuardando(false)
        }
    }

    const columnas = [
        { key: 'idModulo', label: 'Codigo', sortable: true },
        { key: 'nombre', label: 'Modulo', sortable: true },
        {
            key: 'acceso',
            label: 'Acceso',
            render: m => (
                <Form.Check
                    type="switch"
                    id={`acceso-${m.idModulo}`}
                    checked={!!seleccion[m.idModulo]}
                    disabled={guardando}
                    onChange={() => alternar(m.idModulo)}
                    aria-label={`Acceso al modulo ${m.nombre}`}
                />
            )
        }
    ]

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            {cargando ? (
                <div className="text-center p-4">
                    <Spinner animation="border" />
                    <p className="text-muted mt-2">Cargando permisos...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/roles')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <PageHeader title={`Permisos del rol ${rol?.nombre ?? rolId}`} />

                    <div className="d-flex gap-2 mb-3">
                        <button
                            type="button"
                            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={estiloBoton}
                            onClick={() => navigate('/roles')}
                            disabled={guardando}
                            title="Volver al listado"
                            aria-label="Volver al listado"
                        >
                            <i className="bi bi-arrow-left fs-5" />
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={estiloBoton}
                            onClick={guardar}
                            disabled={guardando}
                            title="Guardar"
                            aria-label="Guardar"
                        >
                            {guardando ? <Spinner animation="border" size="sm" /> : <i className="bi bi-floppy fs-5" />}
                        </button>
                    </div>

                    <DataTable
                        title="Modulos a los que tiene acceso el rol"
                        columns={columnas}
                        data={permisos}
                        rowKey="idModulo"
                        pageSize={15}
                        emptyMessage="No hay modulos registrados"
                    />
                </>
            )}
        </div>
    )
}

export default Permisos