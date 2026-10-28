
import { useEffect, useState } from 'react'
import grupoService from '../services/grupoService'
import { mensajeErrorGrupo, normalizarGrupo } from '../utils/grupoUtils'

export default function useGrupos() {
    const [grupos, setGrupos] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)

    useEffect(() => {
        let activo = true

        grupoService.getAll()
            .then(({ data }) => {
                if (!activo) return
                if (!Array.isArray(data)) throw new Error('Respuesta no valida')

                setGrupos(data.map(normalizarGrupo))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeErrorGrupo(error, 'No se pudieron cargar los grupos'))
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => { activo = false }
    }, [])

    const eliminarGrupo = async grupoCode => {
        await grupoService.delete(grupoCode)
        setGrupos(actuales => actuales.filter(g => g.grupoCode !== grupoCode))
    }

    return { grupos, loading, errorCarga, eliminarGrupo }
}
