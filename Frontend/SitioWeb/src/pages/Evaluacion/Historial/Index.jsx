import { useState } from 'react'
import { Button, Form, Table } from 'react-bootstrap'
import historialAcademicoService from '../../../services/historialAcademicoService'

export default function HistorialAcademico() {
  const [tipoIdentificacion, setTipoIdentificacion] = useState('CED')
  const [identificacion, setIdentificacion] = useState('')
  const [rows, setRows] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const consultar = async event => {
    event.preventDefault()
    setMessage('')
    setRows([])
    if (!identificacion.trim()) {
      setMessage('Digite una identificación para consultar')
      return
    }
    setLoading(true)
    try {
      const data = await historialAcademicoService.consultar(tipoIdentificacion, identificacion)
      setRows(Array.isArray(data) ? data : data?.items ?? data?.data ?? [])
    } catch (error) {
      setRows([])
      setMessage(error.response?.data?.mensaje ?? error.response?.data?.title ?? 'No se pudo cargar el historial académico')
    } finally {
      setLoading(false)
    }
  }

  return <section className="container py-4">
    <h1>Historial académico</h1>
    <Form onSubmit={consultar} className="row g-3 mb-4">
      <Form.Group className="col-md-3">
        <Form.Label>Tipo de identificación</Form.Label>
        <Form.Select value={tipoIdentificacion} onChange={event => setTipoIdentificacion(event.target.value)}>
          <option value="CED">Cédula</option>
          <option value="EXT">Extranjero</option>
          <option value="PAS">Pasaporte</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="col-md-5">
        <Form.Label>Identificación</Form.Label>
        <Form.Control required value={identificacion} onChange={event => setIdentificacion(event.target.value)} />
      </Form.Group>
      <div className="col-md-4 d-flex align-items-end">
        <Button type="submit" disabled={loading}>{loading ? 'Consultando...' : 'Consultar historial'}</Button>
      </div>
    </Form>
    {message && <div className="alert alert-danger">{message}</div>}
    <Table striped bordered responsive>
      <thead><tr><th>Curso</th><th>Año</th><th>Periodo</th><th>Promedio</th></tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={`${row.codigoCurso}-${row.anio}-${row.numeroPeriodo}-${index}`}><td>{row.nombreCurso ?? row.codigoCurso}</td><td>{row.anio}</td><td>{row.numeroPeriodo}</td><td>{row.promedio}</td></tr>) : <tr><td colSpan="4" className="text-center">No hay registros para mostrar</td></tr>}</tbody>
    </Table>
  </section>
}
