
import { useEffect, useState } from 'react'
import grupoService from '../services/grupoService'
import { mensajeErrorGrupo, normalizarGrupo } from '../utils/grupoUtils'

export default function useGrupos({ listaCompleta = false } = {}) {
    const [grupos, setGrupos] = useState([])
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
            ? grupoService.getAll()
            : grupoService.getPage(paginaConsulta)

        solicitud
            .then(({ data }) => {
                if (!activo) return

                const registros = listaCompleta ? data : data?.datos

                if (!Array.isArray(registros)) {
                    throw new Error('Respuesta no valida del servicio de grupos')
                }

                const total = listaCompleta
                    ? registros.length
                    : Number(data.totalRegistros)

                const paginas = listaCompleta
                    ? Math.max(1, Math.ceil(total / 15))
                    : Number(data.totalPaginas)

                if (!Number.isFinite(total) || total < 0 ||
                    !Number.isFinite(paginas) || paginas < 0) {
                    throw new Error('Respuesta de paginacion no valida')
                }

                setGrupos(registros.map(normalizarGrupo))
                setTotalRegistros(total)
                setTotalPaginas(Math.max(1, paginas))

                if (!listaCompleta && paginaConsulta > paginas) {
                    setPagina(Math.max(1, paginas))
                }
            })
            .catch(error => {
                if (!activo) return

                setGrupos([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setErrorCarga(
                    mensajeErrorGrupo(error, 'No se pudieron cargar los grupos')
                )
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => {
            activo = false
        }
    }, [listaCompleta, paginaConsulta, actualizacion])

    const eliminarGrupo = async grupoCode => {
        await grupoService.delete(grupoCode)
        setActualizacion(actual => actual + 1)
    }

    return {
        grupos,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas,
        loading,
        errorCarga,
        eliminarGrupo
    }
}
