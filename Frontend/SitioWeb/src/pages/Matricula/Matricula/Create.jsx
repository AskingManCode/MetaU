import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import matriculaService from '../../../services/matriculaService'
import MatriculaForm from './MatriculaForm'

export default function Create() {
    const navigate = useNavigate()
    const location = useLocation()
    const [notification, setNotification] = useState(null)
    const initial = location.state?.initial

    const guardar = async datos => {
        try {
            await matriculaService.create(datos)
            navigate('/matricula', { state: { mensaje: 'Matrícula creada correctamente' } })
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.mensaje ?? 'No se pudo guardar la matrícula'
            })
        }
    }

    return (
        <>
            <Notification {...notification} show={!!notification} onClose={() => setNotification(null)} />
            <MatriculaForm
                title="Nueva matrícula"
                initial={initial}
                onSave={guardar}
                onCancel={() => navigate('/matricula')}
            />
        </>
    )
}
