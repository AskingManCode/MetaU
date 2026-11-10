import { useEffect, useMemo, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../../components/DataTable'
import MaintenanceHeader from '../../../components/MaintenanceHeader'
import Notification from '../../../components/Notification'
import expedienteService from '../../../services/expedienteService'
import { mensajeError, textoBusqueda } from '../../../utils/sistemaUtils'

const list = value => {
    const data = value?.data ?? value

    return Array.isArray(data)
        ? data
        : data?.items ?? data?.datos ?? data?.data ?? []
}

const value = (row, ...keys) => keys
    .map(key => row?.[key])
    .find(item => item !== undefined && item !== null)

const phoneValues = value => {
    if (Array.isArray(value)) {
        return value
            .map(phone => phone?.numero ?? phone?.Numero ?? phone)
            .filter(Boolean)
    }

    if (typeof value === 'string') {
        return value.split(',').map(phone => phone.trim()).filter(Boolean)
    }

    return value ? [value?.numero ?? value?.Numero ?? value] : []
}

function Index() {
    const navigate = useNavigate()
    const location = useLocation()
    const [rows, setRows] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState(
        location.state?.mensaje
            ? { type: 'success', message: location.state.mensaje }
            : null,
    )
    const [pendingDelete, setPendingDelete] = useState(null)

    const load = async () => {
        setLoading(true)

        try {
            setRows(list(await expedienteService.getAll()))
        } catch (error) {
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudieron cargar los expedientes'),
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()

        if (location.state?.mensaje) {
            window.history.replaceState({}, document.title)
        }
    }, [])

    const filtered = useMemo(() => {
        const term = textoBusqueda(search.trim())

        if (!term) {
            return rows
        }

        return rows.filter(row => textoBusqueda([
            value(row, 'identificacion', 'Identificacion'),
            value(row, 'nombreCompleto', 'NombreCompleto'),
            value(row, 'email', 'Email'),
        ].join(' ')).includes(term))
    }, [rows, search])

    const remove = async () => {
        if (!pendingDelete) {
            return
        }

        try {
            await expedienteService.delete(
                value(pendingDelete, 'identificacion', 'Identificacion'),
            )
            setPendingDelete(null)
            setNotification({
                type: 'success',
                message: 'Expediente eliminado correctamente.',
            })
            await load()
        } catch (error) {
            setPendingDelete(null)
            setNotification({
                type: 'error',
                message: mensajeError(error, 'No se pudo eliminar el expediente'),
            })
        }
    }

    const columns = [
        {
            key: 'identificacion',
            label: 'Identificación',
            sortable: true,
            sortValue: row => value(row, 'identificacion', 'Identificacion'),
        },
        {
            key: 'nombreCompleto',
            label: 'Nombre',
            sortable: true,
            sortValue: row => value(row, 'nombreCompleto', 'NombreCompleto'),
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            sortValue: row => value(row, 'email', 'Email'),
        },
        {
            key: 'telefonos',
            label: 'Teléfonos',
            render: row => phoneValues(row.telefonos ?? row.Telefonos).join(', ') || '-',
        },
    ]

    const filters = (
        <div className="row g-3 align-items-end">
            <div className="col-md-9">
                <Form.Label>Nombre, identificación o email</Form.Label>
                <Form.Control
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Buscar expediente"
                />
            </div>

            <div className="col-md-3">
                <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => setSearch('')}
                >
                    <i className="bi bi-arrow-counterclockwise me-2" />
                    Limpiar filtros
                </Button>
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

            <MaintenanceHeader
                title="Mantenimiento de Expedientes"
                buttonLabel="Nuevo Expediente"
                onButtonClick={() => navigate('/expedientes/nuevo')}
            />

            <DataTable
                title="Información"
                columns={columns}
                data={filtered}
                loading={loading}
                rowKey={row => value(row, 'identificacion', 'Identificacion')}
                filters={filters}
                actions={[
                    {
                        type: 'editar',
                        onClick: row => navigate(
                            `/expedientes/editar/${encodeURIComponent(
                                value(row, 'identificacion', 'Identificacion'),
                            )}`,
                        ),
                    },
                    {
                        type: 'eliminar',
                        onClick: setPendingDelete,
                    },
                ]}
            />

            <Notification
                type="warning"
                message={pendingDelete
                    ? '¿Realmente desea eliminar el expediente seleccionado?'
                    : null}
                show={!!pendingDelete}
                onConfirm={remove}
                onCancel={() => setPendingDelete(null)}
                onClose={() => setPendingDelete(null)}
            />
        </div>
    )
}

export default Index
