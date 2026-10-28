
import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import DataTable from '../../../components/DataTable'
import useGrupos from '../../../hooks/useGrupos'
import useCatalogosGrupo from '../../../hooks/useCatalogosGrupo'
import { mensajeErrorGrupo, textoGrupo } from '../../../utils/grupoUtils'

function Grupos() {
    const navigate = useNavigate()
    const location = useLocation()
    const { grupos, loading, errorCarga, eliminarGrupo } = useGrupos()
    const { cursos, profesores, periodos } = useCatalogosGrupo()

    const [notification, setNotification] = useState(
        location.state?.mensaje ? { type: 'success', message: location.state.mensaje } : null
    )
    const [codigo, setCodigo] = useState('')
    const [curso, setCurso] = useState('')
    const [numero, setNumero] = useState('')
    const [periodo, setPeriodo] = useState('')
    const [grupoEliminar, setGrupoEliminar] = useState(null)
    const [eliminando, setEliminando] = useState(false)

    useEffect(() => {
        if (location.state?.mensaje)
            navigate(location.pathname, { replace: true, state: null })
    }, [location.pathname, location.state, navigate])

    useEffect(() => {
        if (errorCarga) setNotification({ type: 'error', message: errorCarga })
    }, [errorCarga])

    const nombresCursos = useMemo(() => new Map(cursos.map(c => [
        c.cursoCode, c.nombre ? `${c.cursoCode} - ${c.nombre}` : c.cursoCode
    ])), [cursos])

    const nombresProfesores = useMemo(() => new Map(profesores.map(p => [
        p.profesorID, p.nombreCompleto || p.profesorID
    ])), [profesores])

    const nombresPeriodos = useMemo(() => new Map(periodos.map(p => [
        p.periodoID, p.anio && p.numeroPeriodo
            ? `${p.anio} - Periodo ${p.numeroPeriodo}`
            : p.periodoID
    ])), [periodos])

    const columnas = useMemo(() => [
        { key: 'grupoCode', label: 'Codigo', sortable: true },
        { key: 'numeroGrupo', label: 'Numero', sortable: true },
        {
            key: 'cursoCode',
            label: 'Curso',
            sortable: true,
            accessor: g => nombresCursos.get(g.cursoCode) || g.cursoCode
        },
        {
            key: 'profesorID',
            label: 'Profesor',
            sortable: true,
            accessor: g => nombresProfesores.get(g.profesorID) || g.profesorID
        },
        { key: 'horario', label: 'Horario', sortable: true },
        { key: 'cupo', label: 'Cupo', sortable: true },
        {
            key: 'periodoID',
            label: 'Periodo',
            sortable: true,
            accessor: g => nombresPeriodos.get(g.periodoID) || g.periodoID
        },
        { key: 'estado', label: 'Estado', sortable: true, render: g => g.estado ? 'Activo' : 'Inactivo' }
    ], [nombresCursos, nombresProfesores, nombresPeriodos])

    const filtrados = useMemo(() => grupos.filter(g =>
        textoGrupo(g.grupoCode).includes(textoGrupo(codigo)) &&
        textoGrupo(g.cursoCode).includes(textoGrupo(curso)) &&
        String(g.numeroGrupo).includes(numero.trim()) &&
        (!periodo || g.periodoID === periodo)
    ), [grupos, codigo, curso, numero, periodo])

    const limpiarFiltros = () => {
        setCodigo('')
        setCurso('')
        setNumero('')
        setPeriodo('')
    }

    const confirmarEliminacion = async () => {
        if (!grupoEliminar || eliminando) return

        setEliminando(true)

        try {
            await eliminarGrupo(grupoEliminar.grupoCode)
            setGrupoEliminar(null)
            setNotification({ type: 'success', message: 'Grupo eliminado correctamente' })
        } catch (error) {
            setGrupoEliminar(null)
            setNotification({
                type: 'error',
                message: mensajeErrorGrupo(error, 'No se pudo eliminar el grupo')
            })
        } finally {
            setEliminando(false)
        }
    }

    const filtros = (
        <div className="row g-2">
            <div className="col-md-3">
                <Form.Label className="small mb-1">Codigo</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar codigo"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                />
            </div>

            <div className="col-md-3">
                <Form.Label className="small mb-1">Curso</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Buscar curso"
                    value={curso}
                    onChange={e => setCurso(e.target.value)}
                />
            </div>

            <div className="col-md-2">
                <Form.Label className="small mb-1">Numero de grupo</Form.Label>
                <Form.Control
                    size="sm"
                    type="number"
                    min="1"
                    max="255"
                    placeholder="Numero"
                    value={numero}
                    onChange={e => setNumero(e.target.value)}
                />
            </div>

            <div className="col-md-2">
                <Form.Label className="small mb-1">Periodo</Form.Label>
                <Form.Select size="sm" value={periodo} onChange={e => setPeriodo(e.target.value)}>
                    <option value="">Todos</option>
                    {periodos.map(p => (
                        <option key={p.periodoID} value={p.periodoID}>
                            {p.anio} - Periodo {p.numeroPeriodo}
                        </option>
                    ))}
                </Form.Select>
            </div>

            <div className="col-md-2 d-flex align-items-end">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={limpiarFiltros}
                >
                    <i className="bi bi-arrow-counterclockwise me-2" />
                    Limpiar filtros
                </button>
            </div>
        </div>
    )

    const acciones = [
        {
            type: 'editar',
            onClick: g => navigate(`/grupos/editar/${encodeURIComponent(g.grupoCode)}`)
        },
        {
            type: 'eliminar',
            onClick: g => setGrupoEliminar(g),
            disabled: eliminando
        }
    ]

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <MaintenanceHeader
                title="Mantenimiento de Grupos"
                buttonLabel="Nuevo Grupo"
                onButtonClick={() => navigate('/grupos/nuevo')}
            />

            <DataTable
                title="Informacion"
                columns={columnas}
                data={filtrados}
                actions={acciones}
                rowKey="grupoCode"
                loading={loading}
                filters={filtros}
                pageSize={15}
                emptyMessage={errorCarga ? 'No se pudieron cargar los grupos' : 'No hay grupos para mostrar'}
            />

            <Modal
                show={!!grupoEliminar}
                onHide={() => !eliminando && setGrupoEliminar(null)}
                centered
                backdrop={eliminando ? 'static' : true}
            >
                <Modal.Header closeButton={!eliminando}>
                    <Modal.Title className="fs-5">Confirmar eliminacion</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Realmente desea eliminar el grupo <strong>{grupoEliminar?.grupoCode}</strong>?
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setGrupoEliminar(null)}
                        disabled={eliminando}
                    >
                        No
                    </Button>

                    <Button
                        variant="primary"
                        onClick={confirmarEliminacion}
                        disabled={eliminando}
                    >
                        {eliminando ? 'Eliminando...' : 'Si'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Grupos
