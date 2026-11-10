import { useEffect, useState } from 'react'
import { mensajeError } from '../utils/sistemaUtils'

const REGISTROS_POR_PAGINA = 15

export default function useListado({ servicio, normalizar, nombre, listaCompleta = false }) {
    const [registros, setRegistros] = useState([])
    const [pagina, setPagina] = useState(1)
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [loading, setLoading] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)
    const [actualizacion, setActualizacion] = useState(0)

    const paginaConsulta = listaCompleta ? 1 : pagina

    useEffect(() => {
        let activo = true

        setLoading(true)
        setErrorCarga(null)

        const solicitud = listaCompleta
            ? servicio.getAll()
            : servicio.getPage(paginaConsulta)

        solicitud
            .then(({ data }) => {
                if (!activo) return

                const lista = listaCompleta ? data : data?.datos

                if (!Array.isArray(lista)) {
                    throw new Error(`Respuesta no valida del servicio de ${nombre}`)
                }

                const total = listaCompleta ? lista.length : Number(data.totalRegistros)
                const paginas = listaCompleta
                    ? Math.max(1, Math.ceil(total / REGISTROS_POR_PAGINA))
                    : Number(data.totalPaginas)

                if (!Number.isFinite(total) || !Number.isFinite(paginas)) {
                    throw new Error('Respuesta de paginacion no valida')
                }

                setRegistros(lista.map(normalizar))
                setTotalRegistros(total)
                setTotalPaginas(Math.max(1, paginas))

                if (!listaCompleta && paginaConsulta > paginas) {
                    setPagina(Math.max(1, paginas))
                }
            })
            .catch(error => {
                if (!activo) return

                setRegistros([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setErrorCarga(mensajeError(error, `No se pudieron cargar los ${nombre}`))
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => {
            activo = false
        }
    }, [servicio, normalizar, nombre, listaCompleta, paginaConsulta, actualizacion])

    const eliminar = async id => {
        await servicio.delete(id)
        setActualizacion(actual => actual + 1)
    }

    return {
        registros,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas,
        loading,
        errorCarga,
        eliminar
    }
}