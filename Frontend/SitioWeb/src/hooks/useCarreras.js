import { useEffect, useRef, useState } from 'react'
import carreraService from '../services/carreraService'
import {
    mensajeErrorCarrera,
    normalizarCarrera
} from '../utils/carreraUtils'

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
        throw new Error('La respuesta de paginación de carreras no es válida.')
    }

    return {
        datos: datos.map(normalizarCarrera),
        tamanoPagina,
        totalRegistros,
        totalPaginas: Math.max(1, Math.ceil(totalPaginas))
    }
}

export default function useCarreras({
    institucionCode = '',
    mostrarUltimaPaginaInicial = false
} = {}) {
    const [carreras, setCarreras] = useState([])
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
    const consultaCliente = useRef(null)

    useEffect(() => {
        const claveConsulta = institucionCode || '*'

        if (
            consultaCliente.current?.clave === claveConsulta &&
            consultaCliente.current?.actualizacion === actualizacion &&
            !mostrarUltimaPagina
        ) {
            setLoading(false)
            return undefined
        }

        if (consultaCliente.current?.clave !== claveConsulta) {
            consultaCliente.current = null
        }

        let activo = true
        setLoading(true)
        setErrorCarga('')

        const solicitudPagina = numeroPagina => institucionCode
            ? carreraService.getPageByInstitucion(institucionCode, numeroPagina)
            : carreraService.getPage(numeroPagina)

        const guardarArreglo = datos => {
            if (!Array.isArray(datos)) {
                throw new Error('La respuesta completa de carreras no es válida.')
            }

            const registros = datos.map(normalizarCarrera)
            const paginas = Math.max(
                1,
                Math.ceil(registros.length / TAMANO_PAGINA_CLIENTE)
            )

            setCarreras(registros)
            setTamanoPagina(TAMANO_PAGINA_CLIENTE)
            setTotalRegistros(registros.length)
            setTotalPaginas(paginas)
            setPaginacionCliente(true)
            setPagina(actual => Math.min(Math.max(actual, 1), paginas))
            consultaCliente.current = { clave: claveConsulta, actualizacion }
        }

        const cargar = async () => {
            try {
                if (mostrarUltimaPagina) {
                    const { data } = await solicitudPagina(1)

                    if (!activo) return

                    if (Array.isArray(data)) {
                        guardarArreglo(data)
                        setPagina(Math.max(
                            1,
                            Math.ceil(data.length / TAMANO_PAGINA_CLIENTE)
                        ))
                    } else {
                        const respuesta = validarPagina(data)
                        setCarreras(respuesta.datos)
                        setTamanoPagina(respuesta.tamanoPagina)
                        setTotalRegistros(respuesta.totalRegistros)
                        setTotalPaginas(respuesta.totalPaginas)
                        setPaginacionCliente(false)
                        setPagina(respuesta.totalPaginas)
                    }

                    setMostrarUltimaPagina(false)
                    return
                }

                const { data } = await solicitudPagina(pagina)

                if (!activo) return

                if (Array.isArray(data)) {
                    guardarArreglo(data)
                } else {
                    const respuesta = validarPagina(data)

                    setCarreras(respuesta.datos)
                    setTamanoPagina(respuesta.tamanoPagina)
                    setTotalRegistros(respuesta.totalRegistros)
                    setTotalPaginas(respuesta.totalPaginas)
                    setPaginacionCliente(false)

                    if (pagina > respuesta.totalPaginas) {
                        setPagina(respuesta.totalPaginas)
                    }
                }
            } catch (error) {
                if (!activo) return

                setCarreras([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setPaginacionCliente(false)
                setErrorCarga(
                    error?.response
                        ? mensajeErrorCarrera(
                            error,
                            'No se pudieron cargar las carreras.'
                        )
                        : error?.message?.startsWith('La respuesta')
                            ? error.message
                            : 'No se pudieron cargar las carreras.'
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
        institucionCode,
        mostrarUltimaPagina,
        pagina
    ])

    const recargar = () => {
        consultaCliente.current = null
        setPaginacionCliente(false)
        setMostrarUltimaPagina(false)
        setActualizacion(actual => actual + 1)
    }

    return {
        carreras,
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
