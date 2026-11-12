import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import notificacionService from '../../../services/notificacionService'
import { mensajeError } from '../../../utils/sistemaUtils'
import NotificacionForm from './NotificacionForm'

function Create() {
    const navigate = useNavigate()
    const [enviando, setEnviando] = useState(false)
    const [notification, setNotification] = useState(null)

    const solicitarEnvio = ({ correos, asunto, cuerpo }) => {
        const cantidad = correos.length
        const textoDestinatarios = cantidad === 1 ? correos[0] : `${cantidad} destinatarios`

        setNotification({
            type: 'warning',
            message: `¿Está seguro de que desea enviar esta notificación a ${textoDestinatarios}?`,
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                setNotification(null)
                setEnviando(true)

                try {
                    if (cantidad === 1) {
                        await notificacionService.enviar({
                            email: correos[0],
                            asunto,
                            cuerpo
                        })
                    } else {
                        await notificacionService.enviarMultiple({
                            emails: correos,
                            asunto,
                            cuerpo
                        })
                    }

                    navigate('/notificaciones', {
                        state: { mensaje: `Notificación enviada correctamente a ${textoDestinatarios}.` }
                    })
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: mensajeError(
                            error,
                            'No se pudo enviar la notificación. Verifique los datos o la configuración del servidor.'
                        )
                    })
                } finally {
                    setEnviando(false)
                }
            }
        })
    }

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

            <NotificacionForm
                titulo="Enviar Notificación"
                onSolicitarEnvio={solicitarEnvio}
                onCancelar={() => navigate('/notificaciones')}
                enviando={enviando}
            />
        </div>
    )
}

export default Create
