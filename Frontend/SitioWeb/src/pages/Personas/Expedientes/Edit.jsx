import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import expedienteService from '../../../services/expedienteService'
import { mensajeError } from '../../../utils/sistemaUtils'
import ExpedienteForm from './ExpedienteForm'

function Edit() {
    const { identificacion } = useParams()
    const navigate = useNavigate()
    const [expediente, setExpediente] = useState(null)
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        expedienteService
            .getById(identificacion)
            .then(response => {
                if (activo) {
                    setExpediente(response.data ?? response)
                }
            })
            .catch(error => {
                if (activo) {
                    setError(mensajeError(error, 'No se pudo cargar el expediente'))
                }
            })
            .finally(() => {
                if (activo) {
                    setLoading(false)
                }
            })

        return () => {
            activo = false
        }
    }, [identificacion])

    const guardar = async datos => {
        if (guardando) {
            return
        }

        setGuardando(true)

        try {
            await expedienteService.update(identificacion, datos)
            navigate('/expedientes', {
                state: { mensaje: 'Expediente actualizado correctamente.' },
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo actualizar el expediente'),
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

            {loading ? (
                <div className="text-center p-4">
                    <Spinner animation="border" />
                    <p className="text-muted mt-2">Cargando expediente...</p>
                </div>
            ) : error ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{error}</div>
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/expedientes')}
                        >
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <ExpedienteForm
                    key={identificacion}
                    titulo="Editar expediente"
                    inicial={expediente}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/expedientes')}
                    guardando={guardando}
                />
            )}
        </>
    )
}

export default Edit
