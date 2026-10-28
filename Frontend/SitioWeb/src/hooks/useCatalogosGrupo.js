
import { useEffect, useState } from 'react'
import cursoService from '../services/cursoService'
import profesorService from '../services/profesorService'
import periodoService from '../services/periodoService'

export default function useCatalogosGrupo() {
    const [cursos, setCursos] = useState([])
    const [profesores, setProfesores] = useState([])
    const [periodos, setPeriodos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let activo = true

        Promise.all([
            cursoService.getAll(),
            profesorService.getAll(),
            periodoService.getAll()
        ])
            .then(([respuestaCursos, respuestaProfesores, respuestaPeriodos]) => {
                if (!activo) return

                if (![respuestaCursos.data, respuestaProfesores.data, respuestaPeriodos.data].every(Array.isArray))
                    throw new Error('Respuesta de catalogos no valida')

                setCursos(respuestaCursos.data.map(c => ({
                    cursoCode: c.cursoCode ?? c.CursoCode ?? '',
                    nombre: c.nombre ?? c.Nombre ?? c.nombreCurso ?? c.NombreCurso ?? ''
                })))

                setProfesores(respuestaProfesores.data.map(p => ({
                    profesorID: p.profesorID ?? p.profesorId ?? p.ProfesorID ?? '',
                    nombreCompleto: p.nombreCompleto ?? p.NombreCompleto ?? '',
                    identificacion: p.identificacion ?? p.Identificacion ?? ''
                })))

                setPeriodos(respuestaPeriodos.data.map(p => ({
                    periodoID: p.periodoID ?? p.periodoId ?? p.PeriodoID ?? '',
                    anio: p.anio ?? p.Anio ?? '',
                    numeroPeriodo: p.numeroPeriodo ?? p.NumeroPeriodo ?? ''
                })))
            })
            .catch(() => {
                if (activo) setError('No se pudieron cargar los cursos, profesores y periodos')
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => { activo = false }
    }, [])

    return { cursos, profesores, periodos, loading, error }
}
