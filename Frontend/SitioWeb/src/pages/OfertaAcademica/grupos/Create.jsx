
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import grupoService from '../../../services/grupoService'
import { mensajeErrorGrupo } from '../../../utils/grupoUtils'
import GrupoForm from './GrupoForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await grupoService.create(datos)

            navigate('/grupos', {
                state: { mensaje: 'Grupo registrado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorGrupo(error, 'No se pudo registrar el grupo')
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

            <GrupoForm
                titulo="Nuevo Grupo"
                onGuardar={guardar}
                onCancelar={() => navigate('/grupos')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create
