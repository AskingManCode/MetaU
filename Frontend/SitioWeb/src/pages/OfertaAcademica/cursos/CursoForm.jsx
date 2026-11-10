import { useEffect, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Notification from '../../../components/Notification'
import useCatalogosCurso from '../../../hooks/useCatalogosCurso'
import cursoModuleServices from '../../../services/cursoModuleServices'
import {
    mensajeErrorCurso,
    mensajeErrorGuardarCurso,
    normalizarCurso,
    normalizarTextoCurso
} from '../../../utils/cursoUtils'

const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/
const codigoValido = /^[A-Z0-9]{1,15}$/

export default function CursoForm({ modo }) {
    const esEdicion = modo === 'editar'
    const { cursoCode: codigoRuta } = useParams()
    const navigate = useNavigate()
    const { carreras, error: errorCarreras, loading: cargandoCarreras } =
        useCatalogosCurso()
    const [curso, setCurso] = useState({
        cursoCode: '',
        carreraCode: '',
        nombre: '',
        nivel: ''
    })
    const [cargandoCurso, setCargandoCurso] = useState(esEdicion)
    const [errorCurso, setErrorCurso] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [notificacion, setNotificacion] = useState(null)

    useEffect(() => {
        if (!esEdicion) return undefined

        let activo = true
        cursoModuleServices.getCurso(codigoRuta)
            .then(({ data }) => {
                if (!activo) return
                setCurso(normalizarCurso(data))
            })
            .catch(error => {
                if (!activo) return
                setErrorCurso(mensajeErrorCurso(error, 'No se pudo cargar el curso.'))
            })
            .finally(() => {
                if (activo) setCargandoCurso(false)
            })

        return () => {
            activo = false
        }
    }, [codigoRuta, esEdicion])

    const actualizarCampo = evento => {
        const { name, value } = evento.target
        setCurso(actual => ({ ...actual, [name]: value }))
    }

    const validar = () => {
        if (!codigoValido.test(curso.cursoCode)) {
            return 'El código es requerido y debe contener solo letras mayúsculas y números (máximo 15).'
        }

        if (!curso.carreraCode) {
            return 'Seleccione una carrera.'
        }

        const nombre = normalizarTextoCurso(curso.nombre)
        if (!nombre) return 'El nombre es requerido.'
        if (nombre.length > 150) {
            return 'El nombre no puede superar los 150 caracteres.'
        }
        if (!nombreValido.test(nombre)) {
            return 'El nombre solo puede contener letras y espacios.'
        }

        const nivel = Number(curso.nivel)
        if (!Number.isInteger(nivel) || nivel < 1 || nivel > 12) {
            return 'El nivel debe ser un número entero entre 1 y 12.'
        }

        return ''
    }

    const guardar = async evento => {
        evento.preventDefault()
        const errorValidacion = validar()

        if (errorValidacion) {
            setNotificacion({ type: 'error', message: errorValidacion })
            return
        }

        if (!esEdicion && (cargandoCarreras || errorCarreras)) {
            setNotificacion({
                type: 'error',
                message: errorCarreras || 'Espere a que se cargue la lista de carreras.'
            })
            return
        }

        const datos = {
            cursoCode: esEdicion ? curso.cursoCode : curso.cursoCode.trim(),
            carreraCode: curso.carreraCode,
            nombre: normalizarTextoCurso(curso.nombre),
            nivel: Number(curso.nivel)
        }

        setGuardando(true)
        setNotificacion(null)

        try {
            if (esEdicion) {
                await cursoModuleServices.actualizarCurso(codigoRuta, datos)
            } else {
                await cursoModuleServices.crearCurso(datos)
            }

            navigate('/cursos', {
                state: {
                    mensaje: esEdicion
                        ? 'Curso actualizado correctamente.'
                        : 'Curso creado correctamente.',
                    mostrarUltimaPagina: true
                }
            })
        } catch (error) {
            setNotificacion({
                type: 'error',
                message: mensajeErrorGuardarCurso(error)
            })
        } finally {
            setGuardando(false)
        }
    }

    if (cargandoCurso) {
        return (
            <div className="d-flex align-items-center gap-2" role="status">
                <Spinner size="sm" />
                <span>Cargando curso...</span>
            </div>
        )
    }

    if (errorCurso) {
        return (
            <div>
                <Alert variant="danger">{errorCurso}</Alert>
                <Button variant="outline-secondary" onClick={() => navigate('/cursos')}>
                    Regresar al listado
                </Button>
            </div>
        )
    }

    return (
        <div>
            <Notification
                type={notificacion?.type}
                message={notificacion?.message}
                show={Boolean(notificacion)}
                onClose={() => setNotificacion(null)}
            />

            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">{esEdicion ? 'Editar curso' : 'Nuevo curso'}</h5>
            </div>

            {errorCarreras && (
                <Alert variant="danger">
                    No se pudo cargar la lista de carreras: {errorCarreras}
                </Alert>
            )}

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <Form onSubmit={guardar} noValidate>
                        <Form.Group className="mb-3" controlId="cursoCode">
                            <Form.Label>Código</Form.Label>
                            <Form.Control
                                name="cursoCode"
                                value={curso.cursoCode}
                                onChange={actualizarCampo}
                                readOnly={esEdicion}
                                maxLength={15}
                                required
                                autoComplete="off"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="carreraCode">
                            <Form.Label>Carrera</Form.Label>
                            {esEdicion ? (
                                <Form.Control value={curso.carreraCode} readOnly />
                            ) : (
                                <Form.Select
                                    name="carreraCode"
                                    value={curso.carreraCode}
                                    onChange={actualizarCampo}
                                    disabled={cargandoCarreras || Boolean(errorCarreras)}
                                    required
                                >
                                    <option value="">
                                        {cargandoCarreras
                                            ? 'Cargando carreras...'
                                            : 'Seleccione una carrera'}
                                    </option>
                                    {carreras.map(carrera => (
                                        <option
                                            key={carrera.carreraCode}
                                            value={carrera.carreraCode}
                                        >
                                            {carrera.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="nombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                name="nombre"
                                value={curso.nombre}
                                onChange={actualizarCampo}
                                maxLength={150}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="nivel">
                            <Form.Label>Nivel</Form.Label>
                            <Form.Control
                                type="number"
                                name="nivel"
                                value={curso.nivel}
                                onChange={actualizarCampo}
                                min={1}
                                max={12}
                                step={1}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button type="submit" disabled={guardando}>
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline-secondary"
                                onClick={() => navigate('/cursos')}
                                disabled={guardando}
                            >
                                Regresar al listado
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}
