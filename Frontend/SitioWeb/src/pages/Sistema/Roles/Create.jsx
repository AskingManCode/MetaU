import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import rolService from '../../../services/rolService'
import { mensajeError } from '../../../utils/sistemaUtils'
import RolForm from './RolForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await rolService.create(datos)

            navigate('/roles', {
                state: { mensaje: 'Rol registrado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo registrar el rol')
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

            <RolForm
                titulo="Nuevo Rol"
                onGuardar={guardar}
                onCancelar={() => navigate('/roles')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create