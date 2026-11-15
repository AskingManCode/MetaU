import { useEffect, useState } from 'react'
import institucionService from '../services/institucionService'
import parametroService from '../services/parametroService'
import { mensajeErrorInstitucion, normalizarInstitucion } from '../utils/institucionUtils'

const TAMANO_PAGINA_DEFECTO = 15

const obtenerTamanoPagina = data => {
    const estado = data?.estado ?? data?.Estado
    const valor = Number(data?.valor ?? data?.Valor)

    if (estado === false || !Number.isSafeInteger(valor) || valor < 1) {
        return TAMANO_PAGINA_DEFECTO
    }

    return valor
}

export default function useInstituciones() {
    const [instituciones, setInstituciones] = useState([])
    const [pageSize, setPageSize] = useState(TAMANO_PAGINA_DEFECTO)
    const [loading, setLoading] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)
    const [errorConfiguracion, setErrorConfiguracion] = useState(null)
    const [actualizacion, setActualizacion] = useState(0)

    useEffect(() => {
        let activo = true

        const cargar = async () => {
            setLoading(true)
            setErrorCarga(null)
            setErrorConfiguracion(null)

            const [institucionesResult, parametroResult] = await Promise.allSettled([
                institucionService.getAll(),
                parametroService.getById('PAGSIZE')
            ])

            if (!activo) return

            if (institucionesResult.status === 'fulfilled') {
                const data = institucionesResult.value.data
                if (Array.isArray(data)) {
                    setInstituciones(data.map(normalizarInstitucion))
                } else {
                    setInstituciones([])
                    setErrorCarga('La respuesta del servicio de instituciones no es válida.')
                }
            } else {
                setInstituciones([])
                setErrorCarga(mensajeErrorInstitucion(
                    institucionesResult.reason,
                    'No se pudieron cargar las instituciones.'
                ))
            }

            if (parametroResult.status === 'fulfilled') {
                setPageSize(obtenerTamanoPagina(parametroResult.value.data))
            } else if (parametroResult.reason?.response?.status === 404) {
                setPageSize(TAMANO_PAGINA_DEFECTO)
            } else {
                setPageSize(TAMANO_PAGINA_DEFECTO)
                setErrorConfiguracion(mensajeErrorInstitucion(
                    parametroResult.reason,
                    'No se pudo cargar PAGSIZE. Se utilizará el tamaño predeterminado de 15.'
                ))
            }

            setLoading(false)
        }

        cargar()

        return () => {
            activo = false
        }
    }, [actualizacion])

    const recargar = () => {
        setActualizacion(actual => actual + 1)
    }

    return {
        instituciones,
        pageSize,
        loading,
        errorCarga,
        errorConfiguracion,
        recargar
    }
}
