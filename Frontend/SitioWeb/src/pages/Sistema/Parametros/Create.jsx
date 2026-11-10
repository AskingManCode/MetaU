import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import parametroService from '../../../services/parametroService'
import { mensajeError } from '../../../utils/sistemaUtils'
import ParametroForm from './ParametroForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await parametroService.create(datos)

            navigate('/parametros', {
                state: { mensaje: 'Parametro registrado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo registrar el parametro')
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

            <ParametroForm
                titulo="Nuevo Parametro"
                onGuardar={guardar}
                onCancelar={() => navigate('/parametros')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create
