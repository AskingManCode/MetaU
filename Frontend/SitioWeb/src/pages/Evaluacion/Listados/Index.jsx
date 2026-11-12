import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useListaEstudiantes from '../../../hooks/useListaEstudiantes'
import {
    abrirVistaPdf,
    descargarArchivo,
    generarCsv,
    registrarBitacora,
    valoresUnicos
} from '../../../utils/listaEstudiantesUtils'

const columnas = [
    { key: 'llave', label: 'Llave', sortable: true },
    { key: 'tipoIdentificacion', label: 'Tipo', sortable: true },
    { key: 'identificacion', label: 'Identificacion', sortable: true },
    { key: 'nombreCompleto', label: 'Nombre', sortable: true },
    { key: 'carrera', label: 'Carrera', sortable: true },
    { key: 'curso', label: 'Curso', sortable: true },
    { key: 'grupo', label: 'Grupo', sortable: true }
]

function Listados() {
    const [periodo, setPeriodo] = useState('')
    const [carrera, setCarrera] = useState('')
    const [curso, setCurso] = useState('')
    const [grupo, setGrupo] = useState('')
    const [notification, setNotification] = useState(null)

    const {
        periodos,
        estudiantes,
        cargandoPeriodos,
        cargando,
        errorCarga
    } = useListaEstudiantes(periodo)

    useEffect(() => {
        if (errorCarga) {
            setNotification({ type: 'error', message: errorCarga })
        }
    }, [errorCarga])

    const opcionesCarrera = useMemo(
        () => valoresUnicos(estudiantes, 'carrera'),
        [estudiantes]
    )

    const opcionesCurso = useMemo(
        () => valoresUnicos(
            estudiantes.filter(e => !carrera || e.carrera === carrera),
            'curso'
        ),
        [estudiantes, carrera]
    )

    const opcionesGrupo = useMemo(
        () => valoresUnicos(
            estudiantes.filter(e =>
                (!carrera || e.carrera === carrera) &&
                (!curso || e.curso === curso)
            ),
            'grupo'
        ),
        [estudiantes, carrera, curso]
    )

    const filtrados = useMemo(() => estudiantes.filter(e =>
        (!carrera || e.carrera === carrera) &&
        (!curso || e.curso === curso) &&
        (!grupo || e.grupo === grupo)
    ), [estudiantes, carrera, curso, grupo])

    const cambiarPeriodo = valor => {
        setPeriodo(valor)
        setCarrera('')
        setCurso('')
        setGrupo('')
    }

    const cambiarCarrera = valor => {
        setCarrera(valor)
        setCurso('')
        setGrupo('')
    }

    const cambiarCurso = valor => {
        setCurso(valor)
        setGrupo('')
    }

    const limpiarFiltros = () => {
        setCarrera('')
        setCurso('')
        setGrupo('')
    }

    const exportar = formato => {
        if (filtrados.length === 0) {
            setNotification({ type: 'info', message: 'No hay registros para exportar' })
            return
        }

        const etiqueta = periodos.find(p => p.periodoId === periodo)?.etiqueta ?? periodo
        const titulo = `Listado de estudiantes matriculados ${etiqueta}`

        if (formato === 'csv') {
            descargarArchivo(
                generarCsv(columnas, filtrados),
                `listado-estudiantes-${periodo}.csv`,
                'text/csv;charset=utf-8'
            )
        } else if (!abrirVistaPdf(titulo, columnas, filtrados)) {
            setNotification({
                type: 'error',
                message: 'El navegador bloqueo la ventana del PDF'
            })
            return
        }

        registrarBitacora(
            `El usuario exporta a ${formato.toUpperCase()} el listado de estudiantes del periodo ${periodo}`
        )
    }

    const filtros = (
        <div>
            <div className="row g-2">
                <div className="col-md-3">
                    <Form.Label className="small mb-1">
                        Periodo
                    </Form.Label>

                    <Form.Select
                        size="sm"
                        value={periodo}
                        disabled={cargandoPeriodos}
                        onChange={e => cambiarPeriodo(e.target.value)}
                    >
                        <option value="">Seleccione un periodo</option>

                        {periodos.map(p => (
                            <option key={p.periodoId} value={p.periodoId}>
                                {p.etiqueta}
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-3">
                    <Form.Label className="small mb-1">
                        Carrera
                    </Form.Label>

                    <Form.Select
                        size="sm"
                        value={carrera}
                        disabled={!periodo || cargando}
                        onChange={e => cambiarCarrera(e.target.value)}
                    >
                        <option value="">Todas</option>

                        {opcionesCarrera.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-3">
                    <Form.Label className="small mb-1">
                        Curso
                    </Form.Label>

                    <Form.Select
                        size="sm"
                        value={curso}
                        disabled={!periodo || cargando}
                        onChange={e => cambiarCurso(e.target.value)}
                    >
                        <option value="">Todos</option>

                        {opcionesCurso.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-3">
                    <Form.Label className="small mb-1">
                        Grupo
                    </Form.Label>

                    <Form.Select
                        size="sm"
                        value={grupo}
                        disabled={!periodo || cargando}
                        onChange={e => setGrupo(e.target.value)}
                    >
                        <option value="">Todos</option>

                        {opcionesGrupo.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-3">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={limpiarFiltros}
                    disabled={!periodo}
                >
                    <i className="bi bi-arrow-counterclockwise me-2" />
                    Limpiar filtros
                </button>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => exportar('csv')}
                    disabled={!periodo || cargando || filtrados.length === 0}
                >
                    <i className="bi bi-filetype-csv me-2" />
                    Exportar CSV
                </button>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => exportar('pdf')}
                    disabled={!periodo || cargando || filtrados.length === 0}
                >
                    <i className="bi bi-file-earmark-pdf me-2" />
                    Exportar PDF
                </button>
            </div>
        </div>
    )

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title="Listado de estudiantes por periodo" />

            <DataTable
                title="Estudiantes matriculados"
                columns={columnas}
                data={filtrados}
                rowKey={e => e.id}
                loading={cargando}
                filters={filtros}
                pageSize={15}
                emptyMessage={
                    periodo
                        ? 'No hay estudiantes matriculados para los filtros seleccionados'
                        : 'Seleccione un periodo para ver el listado'
                }
            />
        </div>
    )
}

export default Listados