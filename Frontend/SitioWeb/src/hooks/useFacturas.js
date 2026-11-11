import { useEffect, useState } from 'react'
import facturaService from '../services/facturaService'
import periodoService from '../services/periodoService'
import { obtenerEstado } from './usePeriodos'
import { mensajeErrorFactura, normalizarFactura } from '../utils/facturaUtils'

export default function useFacturas() {
    const [periodos, setPeriodos] = useState([])
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('')
    const [facturas, setFacturas] = useState([])
    const [loadingPeriodos, setLoadingPeriodos] = useState(true)
    const [loadingFacturas, setLoadingFacturas] = useState(false)
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
                setErrorCarga(mensajeErrorFactura(error, 'No se pudieron cargar los periodos.'))
            })
            .finally(() => {
                if (activo) setLoadingPeriodos(false)
            })

        return () => { activo = false }
    }, [])

    // Cargar facturas cuando cambie el periodo seleccionado o al recargar
    useEffect(() => {
        let activo = true

        if (!periodoSeleccionado) {
            return
        }

        const cargarFacturas = async () => {
            setLoadingFacturas(true)
            setErrorCarga(null)

            try {
                const { data } = await facturaService.getByPeriodo(periodoSeleccionado)
                if (!activo) return
                const lista = Array.isArray(data) ? data : []
                setFacturas(lista.map(normalizarFactura))
            } catch (error) {
                if (!activo) return
                setFacturas([])
                setErrorCarga(mensajeErrorFactura(error, 'No se pudieron cargar las facturas del periodo.'))
            } finally {
                if (activo) setLoadingFacturas(false)
            }
        }

        cargarFacturas()

        return () => { activo = false }
    }, [periodoSeleccionado, actualizacion])

    const recargar = () => {
        setActualizacion(a => a + 1)
    }

    const anularFactura = async (facturaId, motivo) => {
        const respuesta = await facturaService.anular(facturaId, { motivo })
        recargar()
        return respuesta
    }

    return {
        periodos,
        periodoSeleccionado,
        setPeriodoSeleccionado,
        facturas,
        loading: loadingPeriodos || loadingFacturas,
        errorCarga,
        notification,
        setNotification,
        anularFactura,
        recargar
    }
}
