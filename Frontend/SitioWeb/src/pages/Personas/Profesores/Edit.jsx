
import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import profesorService from '../../../services/profesorService'
import { mensajeError, normalizarProfesor } from '../../../utils/profesorUtils'
import ProfesorForm from './ProfesorForm'

function Edit() {
    const { profesorId } = useParams()
    const navigate = useNavigate()

    const [profesor, setProfesor] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        profesorService.getById(profesorId)
            .then(({ data }) => {
                if (activo) setProfesor(normalizarProfesor(data))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudo cargar el profesor'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [profesorId])

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await profesorService.update(profesorId, datos)

            navigate('/profesores', {
                state: { mensaje: 'Profesor actualizado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo actualizar el profesor')
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

            {cargando ? (
                <div className="text-center p-4">
                    <Spinner animation="border" />
                    <p className="text-muted mt-2">Cargando profesor...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/profesores')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <ProfesorForm
                    key={profesorId}
                    titulo="Editar Profesor"
                    inicial={profesor}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/profesores')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit
