import { useEffect, useState } from 'react'
import cursoModuleServices from '../services/cursoModuleServices'
import { normalizarCarreraCurso } from '../utils/cursoUtils'

const obtenerLista = datos => {
    const lista = Array.isArray(datos) ? datos : datos?.datos

    if (!Array.isArray(lista)) {
        throw new Error('La respuesta de carreras no es válida.')
    }

    return lista
}

export default function useCatalogosCurso() {
    const [resultado, setResultado] = useState({
        carreras: [],
        error: '',
        listo: false
    })

    useEffect(() => {
        let activo = true

        cursoModuleServices.getCarreras()
            .then(({ data }) => {
                const carreras = obtenerLista(data).map(normalizarCarreraCurso)
                if (activo) setResultado({ carreras, error: '', listo: true })
            })
            .catch(error => {
                if (!activo) return

                setResultado({
                    carreras: [],
                    error:
                        error?.response?.data?.mensaje ||
                        error?.response?.data?.message ||
                        error?.message ||
                        'No se pudieron cargar las carreras.',
                    listo: true
                })
            })

        return () => {
            activo = false
        }
    }, [])

    return {
        ...resultado,
        loading: !resultado.listo
    }
}
