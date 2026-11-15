import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import institucionService from '../../../services/institucionService'
import { mensajeErrorInstitucion, normalizarInstitucion } from '../../../utils/institucionUtils'
import InstitucionForm from './InstitucionForm'

function Edit() {
    const { institucionId } = useParams()
    const navigate = useNavigate()
    const [resultado, setResultado] = useState({
        institucionId: null,
        institucion: null,
        error: null
    })
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        institucionService.getById(institucionId)
            .then(({ data }) => {
                if (!data || typeof data !== 'object') {
                    throw new Error('La respuesta de la institución no es válida.')
                }
                if (activo) {
                    setResultado({
                        institucionId,
                        institucion: normalizarInstitucion(data),
                        error: null
                    })
                }
            })
            .catch(error => {
                if (activo) {
                    setResultado({
                        institucionId,
                        institucion: null,
                        error: mensajeErrorInstitucion(error, 'No se pudo cargar la institución.')
                    })
                }
            })

        return () => { activo = false }
    }, [institucionId])

    const cargando = resultado.institucionId !== institucionId
    const institucion = cargando ? null : resultado.institucion
    const errorCarga = cargando ? null : resultado.error

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await institucionService.update(institucionId, { nombre: datos.nombre })
            navigate('/instituciones', {
                state: {
                    mensaje: 'Institución actualizada correctamente',
                    institucionCode: institucionId
                }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorInstitucion(
                    error,
                    'No se pudo actualizar la institución.'
                )
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
                    <p className="text-muted mt-2">Cargando institución...</p>
                </div>
            ) : errorCarga || !institucion ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">
                            {errorCarga || 'No se pudo cargar la institución.'}
                        </div>
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/instituciones')}
                        >
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <InstitucionForm
                    key={institucionId}
                    titulo="Editar Institución"
                    inicial={institucion}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/instituciones')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit