
import { useMemo, useState } from 'react'
import { Form } from 'react-bootstrap'
import PageHeader from '../../../components/PageHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useNotas from '../../../hooks/useNotas'
import Create from './Create'
import Edit from './Edit'

const columnas = [
    {
        key: 'nombreRubro',
        label: 'Rubro',
        sortable: true
    },
    {
        key: 'porcentaje',
        label: 'Porcentaje',
        sortable: true,
        sortValue: r => Number(r.porcentaje),
        render: r => `${Number(r.porcentaje)}%`
    },
    {
        key: 'notaActual',
        label: 'Nota',
        sortable: true,
        sortValue: r => r.notaActual ?? -1,
        render: r => r.notaActual === null
            ? 'Sin nota'
            : Number(r.notaActual).toLocaleString('es-CR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
    }
]

export default function Notas() {
    const [grupoCode, setGrupoCode] = useState('')
    const [identificacion, setIdentificacion] = useState('')

    const [modalCrear, setModalCrear] = useState(null)
    const [modalEditar, setModalEditar] = useState(null)
    const [rubroSeleccionado, setRubroSeleccionado] = useState(null)

    const {
        rubros,
        notas,
        grupoConsultado,
        identificacionConsultada,
        loading,
        guardando,
        notification,
        setNotification,
        limpiarConsulta,
        consultar,
        guardarDesglose,
        guardarNota
    } = useNotas()

    const filas = useMemo(() => {
        return rubros.map(rubro => {
            const nota = notas.find(n =>
                String(n.rubroID).toLowerCase() ===
                String(rubro.rubroID).toLowerCase()
            )

            return {
                ...rubro,
                notaActual: nota
                    ? Number(nota.nota)
                    : null
            }
        })
    }, [rubros, notas])

    const tieneNotas = notas.length > 0

    const cambiarGrupo = valor => {
        setGrupoCode(valor)
        limpiarConsulta()
    }

    const cambiarIdentificacion = valor => {
        setIdentificacion(valor)
        limpiarConsulta()
    }

    const consultarDatos = e => {
        e.preventDefault()

        if (loading) return

        consultar(grupoCode, identificacion)
    }

    const limpiarFiltros = () => {
        setGrupoCode('')
        setIdentificacion('')
        limpiarConsulta()
    }

    const abrirDesglose = () => {
        if (!grupoConsultado) return

        if (tieneNotas) {
            setNotification({
                type: 'warning',
                message: 'No se pueden modificar rubros con notas asignadas'
            })
            return
        }

        if (rubros.length > 0) {
            setModalEditar('desglose')
        } else {
            setModalCrear('desglose')
        }
    }

    const abrirNota = rubro => {
        if (!identificacionConsultada) return

        setRubroSeleccionado(rubro)

        if (rubro.notaActual === null) {
            setModalCrear('nota')
        } else {
            setModalEditar('nota')
        }
    }

    const cerrarCrear = () => {
        if (guardando) return

        setModalCrear(null)
        setRubroSeleccionado(null)
    }

    const cerrarEditar = () => {
        if (guardando) return

        setModalEditar(null)
        setRubroSeleccionado(null)
    }

    const acciones = identificacionConsultada
        ? [
            {
                type: 'editar',
                onClick: abrirNota,
                disabled: () => loading || guardando
            }
        ]
        : []

    const filtros = (
        <form onSubmit={consultarDatos}>
            <div className="row g-2 align-items-end">
                <div className="col-md-4">
                    <Form.Label className="small mb-1">
                        Codigo del grupo
                    </Form.Label>

                    <Form.Control
                        size="sm"
                        placeholder="Ingrese el grupo"
                        value={grupoCode}
                        onChange={e =>
                            cambiarGrupo(e.target.value)
                        }
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-5">
                    <Form.Label className="small mb-1">
                        Identificacion del estudiante
                    </Form.Label>

                    <Form.Control
                        size="sm"
                        placeholder="Opcional para consultar rubros"
                        value={identificacion}
                        onChange={e =>
                            cambiarIdentificacion(e.target.value)
                        }
                        disabled={loading}
                    />
                </div>

                <div className="col-md-3 d-flex align-items-end gap-2">
                    <button
                        type="submit"
                        className="btn btn-primary rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: '28px',
                            height: '28px',
                            padding: 0
                        }}
                        title="Consultar"
                        aria-label="Consultar"
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
                        onClick={limpiarFiltros}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-counterclockwise me-2" />
                        Limpiar filtros
                    </button>
                </div>
            </div>

            {grupoConsultado && (
                <div className="mt-3 d-flex justify-content-between align-items-center gap-2 flex-wrap">
                    <small className="text-muted">
                        Grupo: {grupoConsultado}
                        {identificacionConsultada
                            ? ` | Estudiante: ${identificacionConsultada}`
                            : ' | Vista de rubros del grupo'}
                    </small>

                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={abrirDesglose}
                        disabled={loading || guardando || tieneNotas}
                    >
                        <i className="bi bi-plus-lg me-2" />
                        {rubros.length > 0
                            ? 'Modificar desglose'
                            : 'Cargar desglose'}
                    </button>
                </div>
            )}

            {grupoConsultado && rubros.length === 0 && (
                <small className="text-muted d-block mt-2">
                    El grupo no tiene rubros registrados
                </small>
            )}

            {grupoConsultado && identificacionConsultada &&
                rubros.length > 0 && notas.length === 0 && (
                    <small className="text-muted d-block mt-2">
                        El estudiante no tiene notas asignadas
                    </small>
                )}

            {grupoConsultado && tieneNotas && (
                <small className="text-muted d-block mt-2">
                    No es posible modificar los rubros cuando ya existen notas
                    asignadas
                </small>
            )}
        </form>
    )

    return (
        <div>
            <PageHeader title="Administracion de Notas" />

            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <DataTable
                title="Rubros y notas"
                columns={columnas}
                data={filas}
                actions={acciones}
                rowKey="rubroID"
                loading={loading}
                filters={filtros}
                pageSize={15}
                emptyMessage={
                    grupoConsultado
                        ? 'No hay rubros registrados para este grupo'
                        : 'Consulte un grupo para visualizar los rubros'
                }
            />

            <Create
                show={modalCrear !== null}
                tipo={modalCrear}
                grupoCode={grupoConsultado}
                identificacion={identificacionConsultada}
                rubro={rubroSeleccionado}
                rubrosActuales={rubros}
                guardando={guardando}
                onClose={cerrarCrear}
                onGuardar={
                    modalCrear === 'desglose'
                        ? guardarDesglose
                        : guardarNota
                }
            />

            <Edit
                show={modalEditar !== null}
                tipo={modalEditar}
                grupoCode={grupoConsultado}
                identificacion={identificacionConsultada}
                rubro={rubroSeleccionado}
                rubrosActuales={rubros}
                guardando={guardando}
                onClose={cerrarEditar}
                onGuardar={
                    modalEditar === 'desglose'
                        ? guardarDesglose
                        : guardarNota
                }
            />
        </div>
    )
}
