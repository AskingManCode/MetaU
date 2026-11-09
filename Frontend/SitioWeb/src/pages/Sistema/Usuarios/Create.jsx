import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import usuarioService from '../../../services/usuarioService'
import { mensajeError } from '../../../utils/sistemaUtils'
import UsuarioForm from './UsuarioForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await usuarioService.create(datos)

            navigate('/usuarios', {
                state: { mensaje: 'Usuario registrado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo registrar el usuario')
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

            <UsuarioForm
                titulo="Nuevo Usuario"
                onGuardar={guardar}
                onCancelar={() => navigate('/usuarios')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create