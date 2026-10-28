
import { useEffect, useState } from 'react'
import profesorService from '../services/profesorService'
import { mensajeError, normalizarProfesor } from '../utils/profesorUtils'

export default function useProfesores() {
    const [profesores, setProfesores] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)

    useEffect(() => {
        let activo = true

        profesorService.getAll()
            .then(({ data }) => {
                if (!activo) return
                if (!Array.isArray(data)) throw new Error('Respuesta no valida')

                setProfesores(data.map(normalizarProfesor))
            })
            .catch(error => {
                if (activo) setErrorCarga(mensajeError(error, 'No se pudieron cargar los profesores'))
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => { activo = false }
    }, [])

    const eliminarProfesor = async profesorID => {
        await profesorService.delete(profesorID)
        setProfesores(actuales => actuales.filter(p => p.profesorID !== profesorID))
    }

    return { profesores, loading, errorCarga, eliminarProfesor }
}
