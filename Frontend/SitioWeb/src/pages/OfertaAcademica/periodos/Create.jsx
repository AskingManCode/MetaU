
import { useEffect, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import periodoService from '../../../services/periodoService'
import PeriodoForm from './PeriodoForm'

export default function Create() {
    const navigate = useNavigate()
    const [datos, setDatos] = useState({ anio: new Date().getFullYear(), numeroPeriodo: '', fechaInicio: '', fechaFin: '' })
    const [periodos, setPeriodos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        periodoService.getAll().then(({ data }) => setPeriodos(data)).catch(err => setError(err.response?.data?.mensaje || 'No se pudieron cargar los periodos')).finally(() => setCargando(false))
    }, [])

    const guardar = async e => {
        e.preventDefault()
        setError('')
        const anio = Number(datos.anio)
        const numero = Number(datos.numeroPeriodo)

        if (!Number.isInteger(anio) || anio < 1 || anio > 32767) return setError('Ingrese un anio valido')
        if (!Number.isInteger(numero) || numero < 1) return setError('Ingrese un numero de periodo valido')
        if (!datos.fechaInicio || !datos.fechaFin) return setError('Debe ingresar ambas fechas')
        if (datos.fechaFin < datos.fechaInicio) return setError('La fecha de fin no puede ser anterior a la fecha de inicio')

        const duplicado = periodos.some(p => Number(p.anio) === anio && Number(p.numeroPeriodo) === numero)
        if (duplicado) return setError('Ya existe un periodo con el mismo anio y numero')

        const solapado = periodos.some(p => Number(p.anio) === anio && p.fechaInicio?.slice(0, 10) <= datos.fechaFin && p.fechaFin?.slice(0, 10) >= datos.fechaInicio)
        if (solapado) return setError('Las fechas se solapan con otro periodo del mismo anio')

        setGuardando(true)
        try {
            await periodoService.create({ anio, numeroPeriodo: numero, fechaInicio: `${datos.fechaInicio}T00:00:00`, fechaFin: `${datos.fechaFin}T00:00:00` })
            navigate('/periodos', { state: { mensaje: 'Periodo creado correctamente' } })
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo crear el periodo')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {cargando ? <div className="text-center p-4"><Spinner animation="border" /></div> : <PeriodoForm titulo="Nuevo periodo" datos={datos} onChange={(campo, valor) => setDatos(actual => ({ ...actual, [campo]: valor }))} onSubmit={guardar} onCancelar={() => navigate('/periodos')} guardando={guardando} />}
        </>
    )
}
