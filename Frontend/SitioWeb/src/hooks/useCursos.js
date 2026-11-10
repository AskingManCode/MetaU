import { useCallback, useEffect, useState } from 'react'
import cursoService from '../services/cursoService'
import parametroService from '../services/parametroService'
import { mensajeErrorCurso, normalizarCurso } from '../utils/cursoUtils'

const TAMANO_PAGINA_DEFECTO = 15
const TAMANO_PAGINA_MAXIMO = 15

const obtenerTamanoPagina = data => {
    const estado = data?.estado ?? data?.Estado
    const valor = Number(data?.valor ?? data?.Valor)

    if (estado === false || !Number.isSafeInteger(valor) || valor < 1) {
        return TAMANO_PAGINA_DEFECTO
    }

    return Math.min(valor, TAMANO_PAGINA_MAXIMO)
}

export default function useCursos() {
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState({
        version: -1,
        cursos: [],
        pageSize: TAMANO_PAGINA_DEFECTO,
        error: null,
        errorConfiguracion: null
    })

    useEffect(() => {
        let activo = true

        const cargar = async () => {
            const [cursosResult, parametroResult] = await Promise.allSettled([
                cursoService.getAll(),
                parametroService.getById('PAGSIZE')
            ])

            if (!activo) return

            let cursos = []
            let error = null
            let pageSize = TAMANO_PAGINA_DEFECTO
            let errorConfiguracion = null

            if (cursosResult.status === 'fulfilled') {
                if (Array.isArray(cursosResult.value.data)) {
                    cursos = cursosResult.value.data.map(normalizarCurso)
                } else {
                    error = 'La respuesta del servicio de cursos no es válida.'
                }
            } else {
                error = mensajeErrorCurso(
                    cursosResult.reason,
                    'No se pudieron cargar los cursos.'
                )
            }

            if (parametroResult.status === 'fulfilled') {
                pageSize = obtenerTamanoPagina(parametroResult.value.data)
            } else if (parametroResult.reason?.response?.status !== 404) {
                errorConfiguracion = mensajeErrorCurso(
                    parametroResult.reason,
                    'No se pudo cargar PAGSIZE. Se utilizará el tamaño predeterminado de 15.'
                )
            }

            setResultado({
                version,
                cursos,
                pageSize,
                error,
                errorConfiguracion
            })
        }

        cargar()
        return () => { activo = false }
    }, [version])

    const recargar = useCallback(() => {
        setVersion(actual => actual + 1)
    }, [])

    return {
        ...resultado,
        loading: resultado.version !== version,
        recargar
    }
}
