import { useEffect, useState } from 'react'
import listaEstudiantesService from '../services/listaEstudiantesService'
import periodoService from '../services/periodoService'
import {
    mensajeError,
    normalizarEstudiante,
    normalizarPeriodo
} from '../utils/listaEstudiantesUtils'

export default function useListaEstudiantes(periodo) {
    const [periodos, setPeriodos] = useState([])
    const [estudiantes, setEstudiantes] = useState([])
    const [cargandoPeriodos, setCargandoPeriodos] = useState(true)
    const [cargando, setCargando] = useState(false)
    const [errorPeriodos, setErrorPeriodos] = useState(null)
    const [errorListado, setErrorListado] = useState(null)

    useEffect(() => {
        let activo = true

        periodoService.getAll()
            .then(({ data }) => {
                if (!activo) return

                if (!Array.isArray(data)) {
                    throw new Error('Respuesta no valida del servicio de periodos')
                }

                setPeriodos(data.map(normalizarPeriodo))
            })
            .catch(error => {
                if (activo) {
                    setErrorPeriodos(mensajeError(error, 'No se pudieron cargar los periodos'))
                }
            })
            .finally(() => {
                if (activo) setCargandoPeriodos(false)
            })

        return () => {
            activo = false
        }
    }, [])

    useEffect(() => {
        if (!periodo) return

        let activo = true

        setCargando(true)
        setErrorListado(null)

        listaEstudiantesService.getByPeriodo(periodo)
            .then(({ data }) => {
                if (!activo) return

                if (!Array.isArray(data)) {
                    throw new Error('Respuesta no valida del servicio de listado')
                }

                setEstudiantes(data.map(normalizarEstudiante))
            })
            .catch(error => {
                if (!activo) return

                setEstudiantes([])
                setErrorListado(mensajeError(error, 'No se pudo cargar el listado de estudiantes'))
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => {
            activo = false
        }
    }, [periodo])

    return {
        periodos,
        estudiantes: periodo ? estudiantes : [],
        cargandoPeriodos,
        cargando: periodo ? cargando : false,
        errorCarga: errorListado ?? errorPeriodos
    }
}