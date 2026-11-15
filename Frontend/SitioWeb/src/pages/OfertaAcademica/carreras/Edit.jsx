import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import carreraService from '../../../services/carreraService'
import {
    mensajeErrorCarrera,
    normalizarCarrera
} from '../../../utils/carreraUtils'
import CarreraForm from './CarreraForm'

export default function Edit() {
    const { carreraCode } = useParams()
    const navigate = useNavigate()
    const [resultado, setResultado] = useState({
        carreraCode: null,
        carrera: null,
        error: null
    })

    useEffect(() => {
        let activo = true

        carreraService.getById(carreraCode)
            .then(({ data }) => {
                if (!data || typeof data !== 'object') {
                    throw new Error('La respuesta del servicio de carreras no es válida.')
                }

                if (activo) {
                    setResultado({
                        carreraCode,
                        carrera: normalizarCarrera(data),
                        error: null
                    })
                }
            })
            .catch(error => {
                if (activo) {
                    setResultado({
                        carreraCode,
                        carrera: null,
                        error: mensajeErrorCarrera(
                            error,
                            error?.message?.startsWith('La respuesta')
                                ? error.message
                                : 'No se pudo cargar la carrera.'
                        )
                    })
                }
            })

        return () => {
            activo = false
        }
    }, [carreraCode])

    const cargando = resultado.carreraCode !== carreraCode
    const carrera = cargando ? null : resultado.carrera
    const errorCarga = cargando ? null : resultado.error

    const guardar = async datos => {
        await carreraService.update(carreraCode, {
            nombre: datos.nombre,
            directorID: datos.directorID
        })
        navigate('/carreras', {
            state: {
                mensaje: 'Carrera actualizada correctamente.',
                carreraCode
            }
        })
    }

    if (cargando) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status" />
                <p className="text-muted mt-2">Cargando carrera...</p>
            </div>
        )
    }

    if (errorCarga || !carrera) {
        return (
            <>
                <Notification
                    type="error"
                    message={errorCarga || 'No se pudo cargar la carrera.'}
                    show
                    onClose={() => navigate('/carreras')}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/carreras')}
                >
                    Volver al listado
                </button>
            </>
        )
    }

    return (
        <CarreraForm
            key={carreraCode}
            titulo="Editar carrera"
            inicial={carrera}
            esEdicion
            onGuardar={guardar}
            onCancelar={() => navigate('/carreras')}
        />
    )
}