import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import rolService from '../../../services/rolService'
import { mensajeError, normalizarRol } from '../../../utils/sistemaUtils'
import RolForm from './RolForm'

function Edit() {
    const { rolId } = useParams()
    const navigate = useNavigate()

    const [rol, setRol] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        rolService.getById(rolId)
            .then(({ data }) => {
                if (activo) setRol(normalizarRol(data))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudo cargar el rol'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [rolId])

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await rolService.update(rolId, datos)

            navigate('/roles', {
                state: { mensaje: 'Rol actualizado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo actualizar el rol')
            })
        } finally {
            setGuardando(false)
        }
    }

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
                    <p className="text-muted mt-2">Cargando rol...</p>
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
                <RolForm
                    key={rolId}
                    titulo="Editar Rol"
                    inicial={rol}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/roles')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit