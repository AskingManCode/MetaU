import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import institucionService from '../../../services/institucionService'
import { mensajeErrorInstitucion } from '../../../utils/institucionUtils'
import InstitucionForm from './InstitucionForm'

export default function Edit() {
    const { institucionId } = useParams()
    const navigate = useNavigate()
    const [resultado, setResultado] = useState({
        institucionId: null,
        institucion: null,
        error: ''
    })

    useEffect(() => {
        let activo = true

        institucionService.getById(institucionId)
            .then(({ data }) => {
                if (!activo) return

                if (!data || typeof data !== 'object') {
                    throw new Error('Respuesta de institución no válida.')
                }

                setResultado({
                    institucionId,
                    institucion: data,
                    error: ''
                })
            })
            .catch(error => {
                if (!activo) return

                setResultado({
                    institucionId,
                    institucion: null,
                    error: error?.response
                        ? mensajeErrorInstitucion(
                            error,
                            'No se pudo cargar la institución.'
                        )
                        : error?.message?.startsWith('Respuesta')
                            ? error.message
                            : 'No se pudo cargar la institución.'
                })
            })

        return () => {
            activo = false
        }
    }, [institucionId])

    const cargando = resultado.institucionId !== institucionId
    const institucion = cargando ? null : resultado.institucion
    const errorCarga = cargando ? '' : resultado.error

    const guardar = async datos => {
        await institucionService.update(institucionId, datos)
        navigate('/instituciones', {
            state: { mensaje: 'Institución actualizada correctamente.' }
        })
    }

    if (cargando) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status" />
            </div>
        )
    }

    if (errorCarga || !institucion) {
        return (
            <>
                <Notification
                    type="error"
                    message={errorCarga || 'No se pudo cargar la institución.'}
                    show
                    onClose={() => navigate('/instituciones')}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/instituciones')}
                >
                    Regresar al listado
                </button>
            </>
        )
    }

    return (
        <InstitucionForm
            titulo="Editar institución"
            initial={institucion}
            edicion
            onGuardar={guardar}
            onCancelar={() => navigate('/instituciones')}
        />
    )
}