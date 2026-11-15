import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import moduloService from '../../../services/moduloService'
import { mensajeError } from '../../../utils/sistemaUtils'
import ModuloForm from './ModuloForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await moduloService.create(datos)

            navigate('/modulos', {
                state: { mensaje: 'Modulo registrado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo registrar el modulo')
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

            <ModuloForm
                titulo="Nuevo Modulo"
                onGuardar={guardar}
                onCancelar={() => navigate('/modulos')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create