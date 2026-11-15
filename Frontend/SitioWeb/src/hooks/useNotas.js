
import { useState } from 'react'
import notasService from '../services/notaService'

const obtenerMensajeError = error => {
    const estado = error?.response?.status
    const mensaje = error?.response?.data?.mensaje

    if (estado === 400) {
        return mensaje || 'Revise los datos ingresados'
    }

    if (estado === 401) {
        return 'Su sesion expiro o no esta autorizado'
    }

    if (estado === 403) {
        return 'No tiene permisos para realizar esta operacion'
    }

    if (estado === 404) {
        return mensaje || 'No se encontro el registro solicitado'
    }

    if (estado === 409) {
        return mensaje || 'La operacion no esta permitida por el estado actual de las notas'
    }

    if (!error?.response) {
        return 'No fue posible comunicarse con el servicio de Notas'
    }

    return 'Ocurrio un error al procesar la solicitud'
}

export default function useNotas() {
    const [rubros, setRubros] = useState([])
    const [notas, setNotas] = useState([])
    const [grupoConsultado, setGrupoConsultado] = useState('')
    const [identificacionConsultada, setIdentificacionConsultada] = useState('')
    const [loading, setLoading] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [notification, setNotification] = useState(null)

    const limpiarConsulta = () => {
        setRubros([])
        setNotas([])
        setGrupoConsultado('')
        setIdentificacionConsultada('')
        setNotification(null)
    }

    const consultar = async (grupoCode, identificacion) => {
        const grupo = grupoCode.trim()
        const estudiante = identificacion.trim()

        limpiarConsulta()

        if (!grupo) {
            setNotification({
                type: 'warning',
                message: 'Ingrese el codigo del grupo'
            })
            return false
        }

        setLoading(true)

        try {
            const respuestaRubros =
                await notasService.obtenerDesglose(grupo)

            if (!Array.isArray(respuestaRubros.data)) {
                throw new Error('RESPUESTA_INVALIDA')
            }

            let resultadoNotas = []

            if (estudiante) {
                const respuestaNotas =
                    await notasService.obtenerNotas(
                        estudiante,
                        grupo
                    )

                if (!Array.isArray(respuestaNotas.data)) {
                    throw new Error('RESPUESTA_INVALIDA')
                }

                resultadoNotas = respuestaNotas.data
            }

            setRubros(respuestaRubros.data)
            setNotas(resultadoNotas)
            setGrupoConsultado(grupo)
            setIdentificacionConsultada(estudiante)

            return true
        } catch (error) {
            setNotification({
                type: 'danger',
                message: error.message === 'RESPUESTA_INVALIDA'
                    ? 'El servicio devolvio una respuesta inesperada'
                    : obtenerMensajeError(error)
            })

            return false
        } finally {
            setLoading(false)
        }
    }

    const guardarDesglose = async registros => {
        if (!grupoConsultado) {
            setNotification({
                type: 'warning',
                message: 'Primero consulte un grupo'
            })
            return false
        }

        if (!registros.length) {
            setNotification({
                type: 'warning',
                message: 'Debe ingresar al menos un rubro'
            })
            return false
        }

        const nuevosRubros = registros.map(r => ({
            nombreRubro: r.nombreRubro.trim().replace(/\s+/g, ' '),
            porcentaje: Number(r.porcentaje)
        }))

        if (nuevosRubros.some(r =>
            !r.nombreRubro ||
            !Number.isFinite(r.porcentaje) ||
            r.porcentaje <= 0
        )) {
            setNotification({
                type: 'warning',
                message: 'Todos los rubros deben tener nombre y porcentaje mayor a cero'
            })
            return false
        }

        const nombres = nuevosRubros.map(r =>
            r.nombreRubro.toLowerCase()
        )

        if (new Set(nombres).size !== nombres.length) {
            setNotification({
                type: 'warning',
                message: 'No se permiten nombres de rubros repetidos'
            })
            return false
        }

        const total = nuevosRubros.reduce(
            (suma, r) => suma + r.porcentaje,
            0
        )

        if (Math.abs(total - 100) > 0.000001) {
            setNotification({
                type: 'warning',
                message: 'La suma de los porcentajes debe ser 100'
            })
            return false
        }

        if (notas.length > 0) {
            setNotification({
                type: 'warning',
                message: 'No se pueden modificar rubros con notas asignadas'
            })
            return false
        }

        setGuardando(true)

        try {
            await notasService.cargarDesglose({
                grupoCode: grupoConsultado,
                rubros: nuevosRubros
            })

            const respuesta =
                await notasService.obtenerDesglose(
                    grupoConsultado
                )

            setRubros(respuesta.data)
            setNotas([])

            setNotification({
                type: 'success',
                message: 'Desglose guardado correctamente'
            })

            return true
        } catch (error) {
            setNotification({
                type: 'danger',
                message: obtenerMensajeError(error)
            })

            return false
        } finally {
            setGuardando(false)
        }
    }

    const guardarNota = async (rubroID, valor) => {
        if (!identificacionConsultada) {
            setNotification({
                type: 'warning',
                message: 'Primero consulte la identificacion del estudiante'
            })
            return false
        }

        if (String(valor).trim() === '') {
            setNotification({
                type: 'warning',
                message: 'Ingrese la nota'
            })
            return false
        }

        const nota = Number(valor)

        if (!Number.isFinite(nota) || nota < 1 || nota > 100) {
            setNotification({
                type: 'warning',
                message: 'La nota debe estar entre 1 y 100'
            })
            return false
        }

        const existente = notas.some(n =>
            String(n.rubroID).toLowerCase() ===
            String(rubroID).toLowerCase()
        )

        const datos = {
            rubroID,
            identificacion: identificacionConsultada,
            nota
        }

        setGuardando(true)

        try {
            if (existente) {
                await notasService.modificarNota(datos)
            } else {
                await notasService.asignarNota(datos)
            }

            const respuesta = await notasService.obtenerNotas(
                identificacionConsultada,
                grupoConsultado
            )

            setNotas(respuesta.data)

            setNotification({
                type: 'success',
                message: existente
                    ? 'Nota modificada correctamente'
                    : 'Nota asignada correctamente'
            })

            return true
        } catch (error) {
            setNotification({
                type: 'danger',
                message: obtenerMensajeError(error)
            })

            return false
        } finally {
            setGuardando(false)
        }
    }

    return {
        rubros,
        notas,
        grupoConsultado,
        identificacionConsultada,
        loading,
        guardando,
        notification,
        setNotification,
        limpiarConsulta,
        consultar,
        guardarDesglose,
        guardarNota
    }
}
