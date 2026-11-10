
import { useEffect, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import periodoService from '../../../services/periodoService'
import PeriodoForm from './PeriodoForm'

export default function Edit() {
    const { periodoId } = useParams()
    const navigate = useNavigate()
    const [datos, setDatos] = useState(null)
    const [periodos, setPeriodos] = useState([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([periodoService.getById(periodoId), periodoService.getAll()]).then(([respuesta, listado]) => {
            const p = respuesta.data
            setDatos({ anio: p.anio, numeroPeriodo: p.numeroPeriodo, fechaInicio: p.fechaInicio?.slice(0, 10), fechaFin: p.fechaFin?.slice(0, 10) })
            setPeriodos(listado.data)
        }).catch(err => setError(err.response?.data?.mensaje || 'No se pudo cargar el periodo'))
    }, [periodoId])

    const guardar = async e => {
        e.preventDefault()
        setError('')
        const anio = Number(datos.anio)
        const numero = Number(datos.numeroPeriodo)

        if (!Number.isInteger(anio) || anio < 1 || anio > 32767) return setError('Ingrese un anio valido')
        if (!Number.isInteger(numero) || numero < 1) return setError('Ingrese un numero de periodo valido')
        if (!datos.fechaInicio || !datos.fechaFin) return setError('Debe ingresar ambas fechas')
        if (datos.fechaFin < datos.fechaInicio) return setError('La fecha de fin no puede ser anterior a la fecha de inicio')

        const otros = periodos.filter(p => String(p.periodoID).toLowerCase() !== periodoId.toLowerCase())
        const duplicado = otros.some(p => Number(p.anio) === anio && Number(p.numeroPeriodo) === numero)
        if (duplicado) return setError('Ya existe un periodo con el mismo anio y numero')

        const solapado = otros.some(p => Number(p.anio) === anio && p.fechaInicio?.slice(0, 10) <= datos.fechaFin && p.fechaFin?.slice(0, 10) >= datos.fechaInicio)
        if (solapado) return setError('Las fechas se solapan con otro periodo del mismo anio')

        setGuardando(true)
        try {
            await periodoService.update(periodoId, { anio, numeroPeriodo: numero, fechaInicio: `${datos.fechaInicio}T00:00:00`, fechaFin: `${datos.fechaFin}T00:00:00` })
            navigate('/periodos', { state: { mensaje: 'Periodo actualizado correctamente' } })
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo actualizar el periodo')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {datos ? <PeriodoForm titulo="Editar periodo" datos={datos} onChange={(campo, valor) => setDatos(actual => ({ ...actual, [campo]: valor }))} onSubmit={guardar} onCancelar={() => navigate('/periodos')} guardando={guardando} /> : !error && <div className="text-center p-4"><Spinner animation="border" /></div>}
        </>
    )
}
