import { useEffect, useState } from 'react'
import institucionService from '../services/institucionService'
import profesorService from '../services/profesorService'
import {
    mensajeErrorCarrera,
    normalizarInstitucion,
    normalizarProfesor
} from '../utils/carreraUtils'

const obtenerLista = (datos, recurso) => {
    const lista = Array.isArray(datos) ? datos : datos?.datos

    if (!Array.isArray(lista)) {
        throw new Error(`La respuesta de ${recurso} no es válida.`)
    }

    return lista
}

export default function useCatalogosCarrera() {
    const [instituciones, setInstituciones] = useState([])
    const [profesores, setProfesores] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let activo = true

        Promise.all([
            institucionService.getAll(),
            profesorService.getAll()
        ])
            .then(([respuestaInstituciones, respuestaProfesores]) => {
                const listaInstituciones = obtenerLista(
                    respuestaInstituciones.data,
                    'instituciones'
                )
                const listaProfesores = obtenerLista(
                    respuestaProfesores.data,
                    'profesores'
                )

                if (!activo) return

                setInstituciones(listaInstituciones.map(normalizarInstitucion))
                setProfesores(listaProfesores.map(normalizarProfesor))
            })
            .catch(errorCarga => {
                if (!activo) return

                setInstituciones([])
                setProfesores([])
                setError(mensajeErrorCarrera(
                    errorCarga,
                    'No se pudieron cargar las instituciones y los profesores.'
                ))
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => {
            activo = false
        }
    }, [])

    return { instituciones, profesores, loading, error }
}
