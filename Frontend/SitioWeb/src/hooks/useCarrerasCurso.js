import { useEffect, useState } from 'react'
import carreraService from '../services/carreraService'
import { mensajeErrorCurso, normalizarCarreraCurso } from '../utils/cursoUtils'

export default function useCarrerasCurso() {
    const [resultado, setResultado] = useState({
        carreras: [],
        error: null,
        loaded: false
    })

    useEffect(() => {
        let activo = true

        carreraService.getAll()
            .then(({ data }) => {
                if (!Array.isArray(data)) {
                    throw new Error('La respuesta del servicio de carreras no es válida.')
                }
                if (activo) {
                    setResultado({
                        carreras: data.map(normalizarCarreraCurso),
                        error: null,
                        loaded: true
                    })
                }
            })
            .catch(error => {
                if (activo) {
                    setResultado({
                        carreras: [],
                        error: mensajeErrorCurso(error, 'No se pudieron cargar las carreras.'),
                        loaded: true
                    })
                }
            })

        return () => { activo = false }
    }, [])

    return {
        ...resultado,
        loading: !resultado.loaded
    }
}
