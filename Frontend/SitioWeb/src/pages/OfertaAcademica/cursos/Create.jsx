import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Notification'
import cursoService from '../../../services/cursoService'
import { mensajeErrorCurso } from '../../../utils/cursoUtils'
import CursoForm from './CursoForm'

function Create() {
    const navigate = useNavigate()
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)
        try {
            await cursoService.create(datos)
            navigate('/cursos', {
                state: {
                    mensaje: 'Curso registrado correctamente',
                    cursoCode: datos.cursoCode
                }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorCurso(error, 'No se pudo registrar el curso.')
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
            <CursoForm
                titulo="Nuevo Curso"
                onGuardar={guardar}
                onCancelar={() => navigate('/cursos')}
                guardando={guardando}
            />
        </div>
    )
}

export default Create