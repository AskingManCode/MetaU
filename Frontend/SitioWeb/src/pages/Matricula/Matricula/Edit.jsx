import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import matriculaService from '../../../services/matriculaService'
import MatriculaForm from './MatriculaForm'

export default function Edit() {
    const navigate = useNavigate()
    const location = useLocation()
    const [notification, setNotification] = useState(null)
    const initial = location.state?.matricula

    const guardar = async datos => {
        try {
            await matriculaService.update(initial.id, datos)
            navigate('/matricula', { state: { mensaje: 'Matrícula actualizada correctamente' } })
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.mensaje ?? 'No se pudo actualizar la matrícula'
            })
        }
    }

    if (!initial) {
        return <p>No se encontró la matrícula seleccionada.</p>
    }

    return (
        <>
            <Notification {...notification} show={!!notification} onClose={() => setNotification(null)} />
            <MatriculaForm
                title="Editar matrícula"
                initial={initial}
                onSave={guardar}
                onCancel={() => navigate('/matricula')}
            />
        </>
    )
}
