import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import moduloService from '../../../services/moduloService'
import { mensajeError, normalizarModulo } from '../../../utils/sistemaUtils'
import ModuloForm from './ModuloForm'

function Edit() {
    const { moduloId } = useParams()
    const navigate = useNavigate()

    const [modulo, setModulo] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        moduloService.getById(moduloId)
            .then(({ data }) => {
                if (activo) setModulo(normalizarModulo(data))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudo cargar el modulo'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [moduloId])

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await moduloService.update(moduloId, datos)

            navigate('/modulos', {
                state: { mensaje: 'Modulo actualizado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo actualizar el modulo')
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
                    <p className="text-muted mt-2">Cargando modulo...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/modulos')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <ModuloForm
                    key={moduloId}
                    titulo="Editar Modulo"
                    inicial={modulo}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/modulos')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit