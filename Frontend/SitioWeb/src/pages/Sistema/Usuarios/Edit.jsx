import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import usuarioService from '../../../services/usuarioService'
import { mensajeError } from '../../../utils/sistemaUtils'
import { normalizarUsuario } from '../../../utils/usuarioUtils'
import UsuarioForm from './UsuarioForm'

function Edit() {
    const { email } = useParams()
    const navigate = useNavigate()

    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        usuarioService.getByEmail(email)
            .then(({ data }) => {
                if (activo) setUsuario(normalizarUsuario(data))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudo cargar el usuario'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [email])

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await usuarioService.update(email, datos)

            navigate('/usuarios', {
                state: { mensaje: 'Usuario actualizado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo actualizar el usuario')
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
                    <p className="text-muted mt-2">Cargando usuario...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/usuarios')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <UsuarioForm
                    key={email}
                    titulo="Editar Usuario"
                    inicial={usuario}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/usuarios')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit