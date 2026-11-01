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
        error: ''
    })

    useEffect(() => {
        let activo = true
        const codigo = decodeURIComponent(carreraCode)

        carreraService.getById(codigo)
            .then(({ data }) => {
                if (!activo) return
                if (!data || typeof data !== 'object') {
                    throw new Error('La respuesta de carrera no es válida.')
                }

                setResultado({
                    carreraCode,
                    carrera: normalizarCarrera(data),
                    error: ''
                })
            })
            .catch(error => {
                if (!activo) return

                setResultado({
                    carreraCode,
                    carrera: null,
                    error: error?.response
                        ? mensajeErrorCarrera(
                            error,
                            'No se pudo cargar la carrera.'
                        )
                        : error?.message?.startsWith('La respuesta')
                            ? error.message
                            : 'No se pudo cargar la carrera.'
                })
            })

        return () => {
            activo = false
        }
    }, [carreraCode])

    const cargando = resultado.carreraCode !== carreraCode
    const carrera = cargando ? null : resultado.carrera
    const errorCarga = cargando ? '' : resultado.error

    const guardar = async datos => {
        await carreraService.update(
            decodeURIComponent(carreraCode),
            datos
        )
        navigate('/carreras', {
            state: { mensaje: 'Carrera actualizada correctamente.' }
        })
    }

    if (cargando) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status" />
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
                    Regresar
                </button>
            </>
        )
    }

    return (
        <CarreraForm
            titulo="Editar carrera"
            inicial={carrera}
            esEdicion
            onGuardar={guardar}
            onCancelar={() => navigate('/carreras')}
        />
    )
}