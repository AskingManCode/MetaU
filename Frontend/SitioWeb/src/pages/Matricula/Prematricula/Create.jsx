import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import prematriculaService from '../../../services/prematriculaService'
import PrematriculaForm from './PrematriculaForm'

export default function Create() {
    const navigate = useNavigate()
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        try { await prematriculaService.create(datos); navigate('/prematricula', { state: { mensaje: 'Prematrícula creada correctamente' } }) }
        catch (error) { setNotification({ type: 'error', message: error.response?.data?.mensaje ?? 'No se pudo guardar la prematrícula' }) }
    }

    return (
        <>
            <Notification
                {...notification}
                show={!!notification}
                onClose={() => setNotification(null)}
            />
            <PrematriculaForm
                title="Nueva prematrícula"
                onSave={guardar}
                onCancel={() => navigate('/prematricula')}
            />
        </>
    )
}
