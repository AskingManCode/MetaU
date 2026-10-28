
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import profesorService from '../../../services/profesorService'
import { mensajeError } from '../../../utils/profesorUtils'
import ProfesorForm from './ProfesorForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await profesorService.create(datos)

            navigate('/profesores', {
                state: { mensaje: 'Profesor registrado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo registrar el profesor')
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

            <ProfesorForm
                titulo="Nuevo Profesor"
                onGuardar={guardar}
                onCancelar={() => navigate('/profesores')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create
