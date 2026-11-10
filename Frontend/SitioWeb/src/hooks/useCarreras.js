import { useEffect, useState } from 'react'
import carreraService from '../services/carreraService'
import parametroService from '../services/parametroService'
import {
    mensajeErrorCarrera,
    normalizarCarrera
} from '../utils/carreraUtils'

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

export default function useCarreras() {
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState({
        version: -1,
        carreras: [],
        pageSize: TAMANO_PAGINA_DEFECTO,
        error: null,
        errorConfiguracion: null
    })

    useEffect(() => {
        let activo = true

        const cargar = async () => {
            const [carrerasResult, parametroResult] = await Promise.allSettled([
                carreraService.getAll(),
                parametroService.getById('PAGSIZE')
            ])

            if (!activo) return

            let carreras = []
            let error = null
            let pageSize = TAMANO_PAGINA_DEFECTO
            let errorConfiguracion = null

            if (carrerasResult.status === 'fulfilled') {
                const data = carrerasResult.value.data
                const lista = Array.isArray(data) ? data : data?.datos

                if (Array.isArray(lista)) {
                    carreras = lista.map(normalizarCarrera)
                } else {
                    error = 'La respuesta del servicio de carreras no es válida.'
                }
            } else {
                error = mensajeErrorCarrera(
                    carrerasResult.reason,
                    'No se pudieron cargar las carreras.'
                )
            }

            if (parametroResult.status === 'fulfilled') {
                pageSize = obtenerTamanoPagina(parametroResult.value.data)
            } else if (parametroResult.reason?.response?.status !== 404) {
                errorConfiguracion = mensajeErrorCarrera(
                    parametroResult.reason,
                    'No se pudo cargar PAGSIZE. Se utilizará el tamaño predeterminado de 15.'
                )
            }

            setResultado({
                version,
                carreras,
                pageSize,
                error,
                errorConfiguracion
            })
        }

        cargar()
        return () => {
            activo = false
        }
    }, [version])

    return {
        ...resultado,
        loading: resultado.version !== version,
        recargar: () => setVersion(actual => actual + 1)
    }
}
