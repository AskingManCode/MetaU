import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import institucionService from '../../../services/institucionService'
import { mensajeErrorInstitucion } from '../../../utils/institucionUtils'
import InstitucionForm from './InstitucionForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await institucionService.create(datos)
            navigate('/instituciones', {
                state: {
                    mensaje: 'Institución registrada correctamente',
                    institucionCode: datos.institucionCode
                }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorInstitucion(
                    error,
                    'No se pudo registrar la institución.'
                )
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

            <InstitucionForm
                titulo="Nueva Institución"
                onGuardar={guardar}
                onCancelar={() => navigate('/instituciones')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create