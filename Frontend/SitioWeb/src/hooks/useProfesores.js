
import { useEffect, useState } from 'react'
import profesorService from '../services/profesorService'
import { mensajeError, normalizarProfesor } from '../utils/profesorUtils'

export default function useProfesores({ listaCompleta = false } = {}) {
    const [profesores, setProfesores] = useState([])
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
            ? profesorService.getAll()
            : profesorService.getPage(paginaConsulta)

        solicitud
            .then(({ data }) => {
                if (!activo) return

                const registros = listaCompleta ? data : data?.datos

                if (!Array.isArray(registros)) {
                    throw new Error('Respuesta no valida del servicio de profesores')
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

                setProfesores(registros.map(normalizarProfesor))
                setTotalRegistros(total)
                setTotalPaginas(Math.max(1, paginas))

                if (!listaCompleta && paginaConsulta > paginas) {
                    setPagina(Math.max(1, paginas))
                }
            })
            .catch(error => {
                if (!activo) return

                setProfesores([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setErrorCarga(mensajeError(error, 'No se pudieron cargar los profesores'))
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => {
            activo = false
        }
    }, [listaCompleta, paginaConsulta, actualizacion])

    const eliminarProfesor = async profesorID => {
        await profesorService.delete(profesorID)
        setActualizacion(actual => actual + 1)
    }

    return {
        profesores,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas,
        loading,
        errorCarga,
        eliminarProfesor
    }
}
