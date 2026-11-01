
import { useState } from 'react'
import { Form } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import DataTable from '../../../components/DataTable'
import useHistorialAcademico from '../../../hooks/useHistorialAcademico'

const columnas = [
    {
        key: 'codigoCurso',
        label: 'Codigo del curso',
        sortable: true
    },
    {
        key: 'nombreCurso',
        label: 'Nombre del curso',
        sortable: true
    },
    {
        key: 'promedio',
        label: 'Promedio obtenido',
        sortable: true,
        sortValue: h => Number(h.promedio ?? 0),
        render: h => {
            const promedio = Number(h.promedio)

            return Number.isFinite(promedio)
                ? promedio.toLocaleString('es-CR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
                : '-'
        }
    }
]

export default function Historial() {
    const [tipoIdentificacion, setTipoIdentificacion] = useState('')
    const [identificacion, setIdentificacion] = useState('')

    const {
        historial,
        loading,
        error,
        consultado,
        consultar,
        limpiarResultados
    } = useHistorialAcademico()

    const cambiarTipo = valor => {
        setTipoIdentificacion(valor)
        limpiarResultados()
    }

    const cambiarIdentificacion = valor => {
        setIdentificacion(valor)
        limpiarResultados()
    }

    const consultarHistorial = e => {
        e.preventDefault()

        if (loading) return

        consultar(tipoIdentificacion, identificacion)
    }

    const limpiarFormulario = () => {
        setTipoIdentificacion('')
        setIdentificacion('')
        limpiarResultados()
    }

    const cantidadCursos = historial.length

    const mensajeResultados = cantidadCursos === 1
        ? 'Se encontro 1 curso en el historial academico'
        : `Se encontraron ${cantidadCursos} cursos en el historial academico`

    const filtros = (
        <form onSubmit={consultarHistorial}>
            <div className="row g-2">
                <div className="col-12">
                    <small className="text-muted">
                        Ingrese el tipo y numero de identificacion
                        del estudiante para consultar su historial academico
                    </small>
                </div>

                <div className="col-md-4">
                    <Form.Label
                        htmlFor="tipoIdentificacion"
                        className="small mb-1"
                    >
                        Tipo de identificacion
                    </Form.Label>

                    <Form.Control
                        id="tipoIdentificacion"
                        size="sm"
                        type="text"
                        placeholder="Ejemplo: CED"
                        value={tipoIdentificacion}
                        onChange={e =>
                            cambiarTipo(e.target.value)
                        }
                        maxLength={15}
                        autoComplete="off"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="col-md-5">
                    <Form.Label
                        htmlFor="identificacion"
                        className="small mb-1"
                    >
                        Identificacion
                    </Form.Label>

                    <Form.Control
                        id="identificacion"
                        size="sm"
                        type="text"
                        placeholder="Numero de identificacion"
                        value={identificacion}
                        onChange={e =>
                            cambiarIdentificacion(e.target.value)
                        }
                        autoComplete="off"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="col-md-3 d-flex align-items-end">
                    <div className="d-flex align-items-center gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: '28px',
                                height: '28px',
                                padding: 0
                            }}
                            title="Consultar historial"
                            aria-label="Consultar historial"
                            disabled={loading}
                        >
                            {loading ? (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                />
                            ) : (
                                <i className="bi bi-search text-white" />
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={limpiarFormulario}
                            disabled={loading}
                            style={{
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-2" />
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div
                    className="alert alert-danger mt-3 mb-0 py-2"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                </div>
            )}

            {consultado && !error && (
                <small
                    className="text-muted d-block mt-3"
                    role="status"
                >
                    {cantidadCursos === 0
                        ? 'No se encontraron cursos para este estudiante'
                        : mensajeResultados}
                </small>
            )}
        </form>
    )

    return (
        <div>
            <PageHeader title="Consulta de Historial Academico" />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={historial}
                loading={loading}
                filters={filtros}
                pageSize={15}
                emptyMessage={
                    consultado
                        ? 'No hay cursos para mostrar'
                        : 'Ingrese los datos del estudiante para consultar su historial'
                }
            />
        </div>
    )
}
