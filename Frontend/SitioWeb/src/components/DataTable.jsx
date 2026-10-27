
import { useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import '../styles/DataTable.css'

const tiposAccion = {
    ver: { icon: 'bi-eye', label: 'Ver' },
    editar: { icon: 'bi-pencil-square', label: 'Editar' },
    eliminar: { icon: 'bi-trash', label: 'Eliminar' }
}

export default function DataTable({ title = 'Informacion', columns = [], data = [], actions = [], rowKey = 'id', loading = false, filters = null, pageSize = 15, emptyMessage = 'No hay registros para mostrar' }) {
    const [pagina, setPagina] = useState(1)
    const [orden, setOrden] = useState({ key: null, direction: 'asc' })
    const registros = Array.isArray(data) ? data : []

    const obtenerValor = (registro, columna) => {
        if (typeof columna.accessor === 'function') return columna.accessor(registro)
        return registro[columna.key]
    }

    const ordenar = key => {
        setOrden(actual => ({
            key,
            direction: actual.key === key && actual.direction === 'asc' ? 'desc' : 'asc'
        }))
        setPagina(1)
    }

    const ordenados = useMemo(() => {
        if (!orden.key) return registros

        const columna = columns.find(c => c.key === orden.key)
        if (!columna) return registros

        return [...registros].sort((a, b) => {
            const valorA = columna.sortValue ? columna.sortValue(a) : obtenerValor(a, columna)
            const valorB = columna.sortValue ? columna.sortValue(b) : obtenerValor(b, columna)

            const resultado = typeof valorA === 'number' && typeof valorB === 'number'
                ? valorA - valorB
                : String(valorA ?? '').localeCompare(String(valorB ?? ''), 'es', { numeric: true, sensitivity: 'base' })

            return orden.direction === 'asc' ? resultado : -resultado
        })
    }, [registros, columns, orden])

    const totalPaginas = Math.max(1, Math.ceil(ordenados.length / pageSize))
    const paginaActual = Math.min(pagina, totalPaginas)
    const visibles = ordenados.slice((paginaActual - 1) * pageSize, paginaActual * pageSize)
    const totalColumnas = columns.length + (actions.length > 0 ? 1 : 0)

    return (
        <div className="data-table-panel">
            <div className="data-table-header">{title}</div>

            <div className="data-table-body">
                {filters && <div className="data-table-filters">{filters}</div>}

                <div className="table-responsive">
                    <table className="data-table-list">
                        <thead>
                            <tr>
                                {columns.map(columna => (
                                    <th key={columna.key} className={columna.className || ''}>
                                        {columna.sortable ? (
                                            <button type="button" className="data-table-sort" onClick={() => ordenar(columna.key)}>
                                                {columna.label}
                                                <i className={`bi ms-2 ${orden.key === columna.key ? (orden.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down') : 'bi-arrow-down-up'}`} />
                                            </button>
                                        ) : columna.label}
                                    </th>
                                ))}

                                {actions.length > 0 && <th className="data-table-actions-header"></th>}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={totalColumnas} className="data-table-empty">
                                        <Spinner animation="border" size="sm" />
                                    </td>
                                </tr>
                            ) : visibles.length === 0 ? (
                                <tr>
                                    <td colSpan={totalColumnas} className="data-table-empty">{emptyMessage}</td>
                                </tr>
                            ) : visibles.map((registro, index) => (
                                <tr key={typeof rowKey === 'function' ? rowKey(registro) : registro[rowKey] ?? index}>
                                    {columns.map(columna => (
                                        <td key={columna.key} className={columna.className || ''}>
                                            {columna.render ? columna.render(registro) : obtenerValor(registro, columna) ?? '-'}
                                        </td>
                                    ))}

                                    {actions.length > 0 && (
                                        <td className="data-table-actions">
                                            {actions.map((accion, index) => {
                                                const tipo = tiposAccion[accion.type]
                                                if (!tipo) return null
                                                if (accion.visible === false || (typeof accion.visible === 'function' && !accion.visible(registro))) return null

                                                const deshabilitado = typeof accion.disabled === 'function' ? accion.disabled(registro) : !!accion.disabled

                                                return (
                                                    <button
                                                        key={`${accion.type}-${index}`}
                                                        type="button"
                                                        className="data-table-btn"
                                                        title={tipo.label}
                                                        aria-label={tipo.label}
                                                        disabled={deshabilitado}
                                                        onClick={() => accion.onClick(registro)}
                                                    >
                                                        <i className={`bi ${tipo.icon}`} />
                                                    </button>
                                                )
                                            })}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && (
                    <div className="data-table-footer">
                        <span>{ordenados.length} registros</span>

                        {totalPaginas > 1 && (
                            <div className="data-table-pagination">
                                <button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
                                <span>Pagina {paginaActual} de {totalPaginas}</span>
                                <button type="button" disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
