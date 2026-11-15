
import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import grupoService from '../../../services/grupoService'
import { mensajeErrorGrupo, normalizarGrupo } from '../../../utils/grupoUtils'
import GrupoForm from './GrupoForm'

function Edit() {
    const { grupoCode } = useParams()
    const navigate = useNavigate()

    const [grupo, setGrupo] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        grupoService.getById(grupoCode)
            .then(({ data }) => {
                if (activo) setGrupo(normalizarGrupo(data))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeErrorGrupo(error, 'No se pudo cargar el grupo'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [grupoCode])

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await grupoService.update(grupoCode, datos)

            navigate('/grupos', {
                state: { mensaje: 'Grupo actualizado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorGrupo(error, 'No se pudo actualizar el grupo')
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
                    <p className="text-muted mt-2">Cargando grupo...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/grupos')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <GrupoForm
                    key={grupoCode}
                    titulo="Editar Grupo"
                    inicial={grupo}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/grupos')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit
