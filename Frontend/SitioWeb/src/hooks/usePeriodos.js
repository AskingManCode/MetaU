
import { useEffect, useState } from 'react'
import periodoService from '../services/periodoService'

export const obtenerEstado = periodo => {
    const hoy = new Date()
    const fechaActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

    if (!periodo.fechaInicio || !periodo.fechaFin) return 'Sin fechas'
    if (fechaActual < periodo.fechaInicio.slice(0, 10)) return 'Futuro'
    if (fechaActual > periodo.fechaFin.slice(0, 10)) return 'Cerrado'

    return 'Activo'
}

export default function usePeriodos(mensajeInicial = '', { listaCompleta = false } = {}) {
    const [periodos, setPeriodos] = useState([])
    const [notification, setNotification] = useState(
        mensajeInicial ? { type: 'success', message: mensajeInicial } : null
    )
    const [pagina, setPagina] = useState(1)
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [loading, setLoading] = useState(true)
    const [eliminando, setEliminando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(false)
    const [actualizacion, setActualizacion] = useState(0)

    const paginaConsulta = listaCompleta ? 1 : pagina

    useEffect(() => {
        let activo = true

        setLoading(true)
        setErrorCarga(false)

        const solicitud = listaCompleta
            ? periodoService.getAll()
            : periodoService.getPage(paginaConsulta)

        solicitud
            .then(({ data }) => {
                if (!activo) return

                const registros = listaCompleta ? data : data?.datos

                if (!Array.isArray(registros)) {
                    throw new Error('Respuesta no valida del servicio de periodos')
                }

                const total = listaCompleta
                    ? registros.length
                    : Number(data.totalRegistros)

                const paginas = listaCompleta
                    ? Math.max(1, Math.ceil(total / 15))
                    : Number(data.totalPaginas)

                if (!Number.isFinite(total) || !Number.isFinite(paginas)) {
                    throw new Error('Respuesta de paginacion no valida')
                }

                setPeriodos(registros)
                setTotalRegistros(total)
                setTotalPaginas(Math.max(1, paginas))

                if (!listaCompleta && paginaConsulta > paginas) {
                    setPagina(Math.max(1, paginas))
                }
            })
            .catch(error => {
                if (!activo) return

                setPeriodos([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setErrorCarga(true)

                setNotification({
                    type: 'error',
                    message: error.response?.data?.mensaje || 'No se pudieron cargar los periodos'
                })
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => {
            activo = false
        }
    }, [listaCompleta, paginaConsulta, actualizacion])

    const eliminar = periodo => {
        if (eliminando) return

        setNotification({
            type: 'warning',
            message: `Realmente desea eliminar el periodo ${periodo.anio}-${periodo.numeroPeriodo}?`,
            onCancel: () => setNotification(null),
            onConfirm: async () => {
                if (eliminando) return

                setNotification(null)
                setEliminando(true)

                try {
                    await periodoService.delete(periodo.periodoID)

                    setNotification({
                        type: 'success',
                        message: 'Periodo eliminado correctamente'
                    })

                    setActualizacion(actual => actual + 1)
                } catch (error) {
                    setNotification({
                        type: 'error',
                        message: error.response?.data?.mensaje || 'No se pudo eliminar el periodo'
                    })
                } finally {
                    setEliminando(false)
                }
            }
        })
    }

    return {
        periodos,
        notification,
        setNotification,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas,
        loading,
        eliminando,
        errorCarga,
        eliminar
    }
}
