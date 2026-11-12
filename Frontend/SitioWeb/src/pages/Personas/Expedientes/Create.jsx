import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import expedienteService from '../../../services/expedienteService'
import { mensajeError } from '../../../utils/sistemaUtils'
import ExpedienteForm from './ExpedienteForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) {
            return
        }

        setGuardando(true)

        try {
            await expedienteService.create(datos)
            navigate('/expedientes', {
                state: { mensaje: 'Expediente creado correctamente.' },
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo guardar el expediente'),
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <ExpedienteForm
                titulo="Nuevo expediente"
                onGuardar={guardar}
                onCancelar={() => navigate('/expedientes')}
                guardando={guardando}
            />
        </>
    )
}

export default Create
