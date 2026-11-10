import { useEffect, useState } from 'react'
import cursoModuleServices from '../services/cursoModuleServices'
import {
    mensajeErrorCurso,
    normalizarCurso
} from '../utils/cursoUtils'

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
        throw new Error('La respuesta de paginación de cursos no es válida.')
    }

    return {
        cursos: datos.map(normalizarCurso),
        tamanoPagina,
        totalRegistros,
        totalPaginas: Math.max(1, Math.ceil(totalPaginas))
    }
}

export default function useCursos({
    carreraCode = '',
    nivel = '',
    mostrarUltimaPaginaInicial = false
} = {}) {
    const [cursos, setCursos] = useState([])
    const [pagina, setPagina] = useState(1)
    const [tamanoPagina, setTamanoPagina] = useState(TAMANO_PAGINA_CLIENTE)
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [paginacionCliente, setPaginacionCliente] = useState(false)
    const [errorCarga, setErrorCarga] = useState('')
    const [version, setVersion] = useState(0)
    const [mostrarUltimaPagina, setMostrarUltimaPagina] = useState(
        mostrarUltimaPaginaInicial
    )
    const [listado, setListado] = useState({
        consulta: '',
        pagina: 0,
        cursos: [],
        error: ''
    })
    const [consultaCliente, setConsultaCliente] = useState('')

    const consulta = JSON.stringify({ carreraCode, nivel, version })
    const usaPaginacionCliente = Boolean(nivel) ||
        consultaCliente === consulta
    const clavePagina = usaPaginacionCliente ? consulta : `${consulta}:${pagina}`
    const loading = listado.consulta !== clavePagina

    useEffect(() => {
        let activo = true

        if (
            consultaCliente === consulta &&
            !mostrarUltimaPagina
        ) {
            return undefined
        }

        const cargarPagina = numero => carreraCode
            ? cursoModuleServices.getCursosPorCarrera(carreraCode, numero)
            : cursoModuleServices.getCursos(numero)
        const cargarCompleto = () => carreraCode
            ? cursoModuleServices.getCursosPorCarrera(carreraCode)
            : cursoModuleServices.getCursos()

        const guardarCompleto = datos => {
            if (!Array.isArray(datos)) {
                throw new Error('La respuesta completa de cursos no es válida.')
            }

            const registros = datos.map(normalizarCurso)
            const filtrados = nivel
                ? registros.filter(curso => Number(curso.nivel) === Number(nivel))
                : registros
            const paginas = Math.max(
                1,
                Math.ceil(filtrados.length / TAMANO_PAGINA_CLIENTE)
            )
            const nuevaPagina = mostrarUltimaPagina
                ? paginas
                : Math.min(Math.max(pagina, 1), paginas)

            setConsultaCliente(consulta)
            setCursos(filtrados)
            setTamanoPagina(TAMANO_PAGINA_CLIENTE)
            setTotalRegistros(filtrados.length)
            setTotalPaginas(paginas)
            setPaginacionCliente(true)
            setPagina(nuevaPagina)
            setListado({
                consulta,
                pagina: nuevaPagina,
                cursos: filtrados,
                error: ''
            })
            setMostrarUltimaPagina(false)
        }

        const guardarServidor = respuesta => {
            const datosPagina = validarPagina(respuesta)
            const nuevaPagina = mostrarUltimaPagina
                ? datosPagina.totalPaginas
                : Math.min(Math.max(pagina, 1), datosPagina.totalPaginas)

            setCursos(datosPagina.cursos)
            setTamanoPagina(datosPagina.tamanoPagina)
            setTotalRegistros(datosPagina.totalRegistros)
            setTotalPaginas(datosPagina.totalPaginas)
            setPaginacionCliente(false)
            setPagina(nuevaPagina)
            setListado({
                consulta: `${consulta}:${nuevaPagina}`,
                pagina: nuevaPagina,
                cursos: datosPagina.cursos,
                error: ''
            })
            setMostrarUltimaPagina(false)
        }

        const cargar = async () => {
            setErrorCarga('')

            try {
                if (nivel) {
                    const { data } = await cargarCompleto()
                    if (!activo) return
                    guardarCompleto(data)
                    return
                }

                if (mostrarUltimaPagina) {
                    const { data } = await cargarPagina(1)
                    if (!activo) return

                    if (Array.isArray(data)) {
                        guardarCompleto(data)
                    } else {
                        const primeraPagina = validarPagina(data)
                        if (primeraPagina.totalPaginas <= 1) {
                            guardarServidor(data)
                        } else {
                            const { data: ultima } = await cargarPagina(
                                primeraPagina.totalPaginas
                            )
                            if (!activo) return

                            if (Array.isArray(ultima)) {
                                guardarCompleto(ultima)
                            } else {
                                guardarServidor(ultima)
                            }
                        }
                    }
                    return
                }

                if (consultaCliente === consulta) {
                    return
                }

                const { data } = await cargarPagina(pagina)
                if (!activo) return

                if (Array.isArray(data)) {
                    guardarCompleto(data)
                } else {
                    guardarServidor(data)
                }
            } catch (error) {
                if (!activo) return

                const mensaje = error?.response
                    ? mensajeErrorCurso(error, 'No se pudieron cargar los cursos.')
                    : error?.message?.startsWith('La respuesta')
                        ? error.message
                        : 'No se pudieron cargar los cursos.'

                setCursos([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setPaginacionCliente(false)
                setErrorCarga(mensaje)
                setListado({
                    consulta: clavePagina,
                    pagina,
                    cursos: [],
                    error: mensaje
                })
            }
        }

        cargar()

        return () => {
            activo = false
        }
    }, [
        carreraCode,
        consulta,
        consultaCliente,
        clavePagina,
        nivel,
        mostrarUltimaPagina,
        pagina
    ])

    const recargar = () => {
        setConsultaCliente('')
        setPaginacionCliente(false)
        setMostrarUltimaPagina(false)
        setVersion(actual => actual + 1)
    }

    return {
        cursos,
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
