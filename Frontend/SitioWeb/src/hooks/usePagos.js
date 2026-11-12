import { useEffect, useState } from 'react'
import pagoService from '../services/pagoService'
import periodoService from '../services/periodoService'
import { obtenerEstado } from './usePeriodos'
import { mensajeErrorPago, normalizarPago } from '../utils/pagoUtils'

export default function usePagos() {
    const [periodos, setPeriodos] = useState([])
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('')
    const [pagos, setPagos] = useState([])
    const [loadingPeriodos, setLoadingPeriodos] = useState(true)
    const [loadingPagos, setLoadingPagos] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)
    const [notification, setNotification] = useState(null)
    const [actualizacion, setActualizacion] = useState(0)

    // Cargar periodos al inicio
    useEffect(() => {
        let activo = true

        periodoService.getAll()
            .then(({ data }) => {
                if (!activo) return

                const lista = Array.isArray(data) ? data : data?.datos ?? []
                setPeriodos(lista)

                if (lista.length > 0) {
                    const periodoActivo = lista.find(p => obtenerEstado(p) === 'Activo')
                    const inicial = periodoActivo ? periodoActivo.periodoID : lista[0].periodoID
                    setPeriodoSeleccionado(prev => prev || inicial)
                }
            })
            .catch(error => {
                if (!activo) return
                setErrorCarga(mensajeErrorPago(error, 'No se pudieron cargar los periodos.'))
            })
            .finally(() => {
                if (activo) setLoadingPeriodos(false)
            })

        return () => { activo = false }
    }, [])

    // Cargar pagos cuando cambie el periodo seleccionado o al recargar
    useEffect(() => {
        let activo = true

        if (!periodoSeleccionado) {
            return
        }

        const cargarPagos = async () => {
            setLoadingPagos(true)
            setErrorCarga(null)

            try {
                const { data } = await pagoService.getByPeriodo(periodoSeleccionado)
                if (!activo) return
                const lista = Array.isArray(data) ? data : []
                setPagos(lista.map(normalizarPago))
            } catch (error) {
                if (!activo) return
                setPagos([])
                setErrorCarga(mensajeErrorPago(error, 'No se pudieron cargar los pagos del periodo.'))
            } finally {
                if (activo) setLoadingPagos(false)
            }
        }

        cargarPagos()

        return () => { activo = false }
    }, [periodoSeleccionado, actualizacion])

    const recargar = () => {
        setActualizacion(a => a + 1)
    }

    const registrarPago = async facturaId => {
        const respuesta = await pagoService.create(facturaId)
        recargar()
        return respuesta
    }

    const reversarPago = async (pagoId, motivo) => {
        const respuesta = await pagoService.reversar(pagoId, { motivo })
        recargar()
        return respuesta
    }

    return {
        periodos,
        periodoSeleccionado,
        setPeriodoSeleccionado,
        pagos,
        loading: loadingPeriodos || loadingPagos,
        errorCarga,
        notification,
        setNotification,
        registrarPago,
        reversarPago,
        recargar
    }
}
