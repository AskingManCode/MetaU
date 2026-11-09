import { useEffect, useRef, useState } from 'react'
import institucionService from '../services/institucionService'
import { mensajeErrorInstitucion } from '../utils/institucionUtils'

const TAMANO_PAGINA_CLIENTE = 15

const validarPagina = respuesta => {
    const datos = respuesta?.datos
    const tamanoPagina = Number(respuesta?.tamanoPagina)
    const totalRegistros = Number(respuesta?.totalRegistros)
    const totalPaginas = Number(respuesta?.totalPaginas)

    if (
        !Array.isArray(datos) ||
        !Number.isInteger(tamanoPagina) ||
        tamanoPagina < 1 ||
        !Number.isFinite(totalRegistros) ||
        totalRegistros < 0 ||
        !Number.isFinite(totalPaginas) ||
        totalPaginas < 0
    ) {
        throw new Error('Respuesta de paginación de instituciones no válida.')
    }

    return {
        datos,
        tamanoPagina,
        totalRegistros,
        totalPaginas: Math.max(1, Math.ceil(totalPaginas))
    }
}

export default function useInstituciones({
    listaCompleta = false,
    mostrarUltimaPaginaInicial = false
} = {}) {
    const [instituciones, setInstituciones] = useState([])
    const [pagina, setPagina] = useState(1)
    const [tamanoPagina, setTamanoPagina] = useState(TAMANO_PAGINA_CLIENTE)
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [paginacionCliente, setPaginacionCliente] = useState(false)
    const [mostrarUltimaPagina, setMostrarUltimaPagina] = useState(
        mostrarUltimaPaginaInicial
    )
    const [loading, setLoading] = useState(true)
    const [errorCarga, setErrorCarga] = useState('')
    const [actualizacion, setActualizacion] = useState(0)
    const modoAnterior = useRef(listaCompleta)

    useEffect(() => {
        let activo = true
        const cambioModo = modoAnterior.current !== listaCompleta
        modoAnterior.current = listaCompleta

        if (cambioModo) {
            setPaginacionCliente(false)
        }

        if (
            paginacionCliente &&
            !listaCompleta &&
            !mostrarUltimaPagina &&
            !cambioModo
        ) {
            setLoading(false)
            return undefined
        }

        setLoading(true)
        setErrorCarga('')

        const guardarArregloCompleto = (datos, paginarEnCliente = true) => {
            if (!Array.isArray(datos)) {
                throw new Error('Respuesta completa de instituciones no válida.')
            }

            const paginas = Math.max(
                1,
                Math.ceil(datos.length / TAMANO_PAGINA_CLIENTE)
            )

            setInstituciones(datos)
            setTamanoPagina(TAMANO_PAGINA_CLIENTE)
            setTotalRegistros(datos.length)
            setTotalPaginas(paginas)
            setPaginacionCliente(paginarEnCliente)
            setPagina(actual => Math.min(Math.max(actual, 1), paginas))
        }

        const guardarPaginaServidor = respuesta => {
            const paginaRespuesta = validarPagina(respuesta)

            setInstituciones(paginaRespuesta.datos)
            setTamanoPagina(paginaRespuesta.tamanoPagina)
            setTotalRegistros(paginaRespuesta.totalRegistros)
            setTotalPaginas(paginaRespuesta.totalPaginas)
            setPaginacionCliente(false)

            if (pagina > paginaRespuesta.totalPaginas) {
                setPagina(paginaRespuesta.totalPaginas)
            }
        }

        const cargar = async () => {
            try {
                if (listaCompleta) {
                    const { data } = await institucionService.getAll()

                    if (!activo) return

                    guardarArregloCompleto(data, false)
                    return
                }

                if (mostrarUltimaPagina) {
                    const { data } = await institucionService.getPage(1)

                    if (!activo) return

                    if (Array.isArray(data)) {
                        guardarArregloCompleto(data)
                        setPagina(Math.max(
                            1,
                            Math.ceil(data.length / TAMANO_PAGINA_CLIENTE)
                        ))
                    } else {
                        const paginaRespuesta = validarPagina(data)
                        setTamanoPagina(paginaRespuesta.tamanoPagina)
                        setTotalRegistros(paginaRespuesta.totalRegistros)
                        setTotalPaginas(paginaRespuesta.totalPaginas)
                        setPaginacionCliente(false)
                        setPagina(paginaRespuesta.totalPaginas)
                    }

                    setMostrarUltimaPagina(false)
                    return
                }

                const { data } = await institucionService.getPage(pagina)

                if (!activo) return

                if (Array.isArray(data)) {
                    guardarArregloCompleto(data)
                } else {
                    guardarPaginaServidor(data)
                }
            } catch (error) {
                if (!activo) return

                setInstituciones([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setPaginacionCliente(false)
                setErrorCarga(
                    error?.response
                        ? mensajeErrorInstitucion(
                            error,
                            'No se pudieron cargar las instituciones.'
                        )
                        : error?.message?.startsWith('Respuesta')
                            ? error.message
                            : 'No se pudieron cargar las instituciones.'
                )
            } finally {
                if (activo) setLoading(false)
            }
        }

        cargar()

        return () => {
            activo = false
        }
    }, [
        actualizacion,
        listaCompleta,
        mostrarUltimaPagina,
        pagina,
        paginacionCliente
    ])

    const recargar = () => {
        setPaginacionCliente(false)
        setMostrarUltimaPagina(false)
        setActualizacion(actual => actual + 1)
    }

    return {
        instituciones,
        pagina,
        setPagina,
        tamanoPagina,
        totalRegistros,
        totalPaginas,
        paginacionCliente,
        loading,
        errorCarga,
        recargar
    }
}
