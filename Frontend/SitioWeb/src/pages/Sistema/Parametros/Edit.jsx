import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import parametroService from '../../../services/parametroService'
import { mensajeError, normalizarParametro } from '../../../utils/sistemaUtils'
import ParametroForm from './ParametroForm'

function Edit() {
    const { parametroCode } = useParams()
    const navigate = useNavigate()

    const [parametro, setParametro] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        parametroService.getById(parametroCode)
            .then(({ data }) => {
                if (activo) setParametro(normalizarParametro(data))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudo cargar el parametro'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [parametroCode])

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)

        try {
            await parametroService.update(parametroCode, { valor: datos.valor })

            navigate('/parametros', {
                state: { mensaje: 'Parametro actualizado correctamente' }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo actualizar el parametro')
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
                    <p className="text-muted mt-2">Cargando parametro...</p>
                </div>
            ) : errorCarga ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">{errorCarga}</div>
                        <Button variant="outline-secondary" onClick={() => navigate('/parametros')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <ParametroForm
                    key={parametroCode}
                    titulo="Editar Parametro"
                    inicial={parametro}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/parametros')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit
