
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

export default function usePeriodos(mensajeInicial = '') {
    const [periodos, setPeriodos] = useState([])
    const [notification, setNotification] = useState(mensajeInicial ? { type: 'success', message: mensajeInicial } : null)
    const [loading, setLoading] = useState(true)
    const [eliminando, setEliminando] = useState(false)
    const [errorCarga, setErrorCarga] = useState(false)

    useEffect(() => {
        let activo = true

        periodoService.getAll()
            .then(({ data }) => {
                if (activo) setPeriodos(Array.isArray(data) ? data : [])
            })
            .catch(error => {
                if (!activo) return
                setErrorCarga(true)
                setNotification({ type: 'error', message: error.response?.data?.mensaje || 'No se pudieron cargar los periodos' })
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => { activo = false }
    }, [])

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
                    setPeriodos(actuales => actuales.filter(p => p.periodoID !== periodo.periodoID))
                    setNotification({ type: 'success', message: 'Periodo eliminado correctamente' })
                } catch (error) {
                    setNotification({ type: 'error', message: error.response?.data?.mensaje || 'No se pudo eliminar el periodo' })
                } finally {
                    setEliminando(false)
                }
            }
        })
    }

    return { periodos, notification, setNotification, loading, eliminando, errorCarga, eliminar }
}
