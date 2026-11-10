import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import cursoService from '../../../services/cursoService'
import { mensajeErrorCurso, normalizarCurso } from '../../../utils/cursoUtils'
import CursoForm from './CursoForm'

function Edit() {
    const { cursoCode } = useParams()
    const navigate = useNavigate()
    const [resultado, setResultado] = useState({
        cursoCode: null,
        curso: null,
        error: null
    })
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        let activo = true

        cursoService.getById(cursoCode)
            .then(({ data }) => {
                if (!data || typeof data !== 'object') {
                    throw new Error('La respuesta del curso no es válida.')
                }
                if (activo) {
                    setResultado({
                        cursoCode,
                        curso: normalizarCurso(data),
                        error: null
                    })
                }
            })
            .catch(error => {
                if (activo) {
                    setResultado({
                        cursoCode,
                        curso: null,
                        error: mensajeErrorCurso(error, 'No se pudo cargar el curso.')
                    })
                }
            })

        return () => { activo = false }
    }, [cursoCode])

    const cargando = resultado.cursoCode !== cursoCode
    const curso = cargando ? null : resultado.curso
    const errorCarga = cargando ? null : resultado.error

    const guardar = async datos => {
        if (guardando) return

        setGuardando(true)
        try {
            await cursoService.update(cursoCode, {
                cursoCode,
                carreraCode: curso.carreraCode,
                nombre: datos.nombre,
                nivel: datos.nivel
            })
            navigate('/cursos', {
                state: {
                    mensaje: 'Curso actualizado correctamente',
                    cursoCode
                }
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeErrorCurso(error, 'No se pudo actualizar el curso.')
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
                    <p className="text-muted mt-2">Cargando curso...</p>
                </div>
            ) : errorCarga || !curso ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="alert alert-danger">
                            {errorCarga || 'No se pudo cargar el curso.'}
                        </div>
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/cursos')}
                        >
                            Volver al listado
                        </Button>
                    </div>
                </div>
            ) : (
                <CursoForm
                    key={cursoCode}
                    titulo="Editar Curso"
                    inicial={curso}
                    esEdicion
                    onGuardar={guardar}
                    onCancelar={() => navigate('/cursos')}
                    guardando={guardando}
                />
            )}
        </div>
    )
}

export default Edit