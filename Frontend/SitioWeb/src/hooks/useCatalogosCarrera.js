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
    const [resultado, setResultado] = useState({
        instituciones: [],
        profesores: [],
        loading: true,
        error: null
    })

    useEffect(() => {
        let activo = true

        Promise.all([
            institucionService.getAll(),
            profesorService.getAll()
        ])
            .then(([respuestaInstituciones, respuestaProfesores]) => {
                const instituciones = obtenerLista(
                    respuestaInstituciones.data,
                    'instituciones'
                ).map(normalizarInstitucion)
                const profesores = obtenerLista(
                    respuestaProfesores.data,
                    'profesores'
                ).map(normalizarProfesor)

                if (activo) {
                    setResultado({
                        instituciones,
                        profesores,
                        loading: false,
                        error: null
                    })
                }
            })
            .catch(error => {
                if (activo) {
                    setResultado({
                        instituciones: [],
                        profesores: [],
                        loading: false,
                        error: mensajeErrorCarrera(
                            error,
                            error?.message?.startsWith('La respuesta')
                                ? error.message
                                : 'No se pudieron cargar las instituciones y los profesores.'
                        )
                    })
                }
            })

        return () => {
            activo = false
        }
    }, [])

    return resultado
}
