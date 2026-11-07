import { useMemo, useState } from 'react'
import '../styles/DataTable.css'

const icons = { editar: 'bi-pencil-square', eliminar: 'bi-trash' }

export default function DataTable({ title = 'Información', columns = [], data = [], actions = [], rowKey = 'id', loading = false, filters = null, pageSize = 15, emptyMessage = 'No hay registros para mostrar' }) {
    const [page, setPage] = useState(1)
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
    const current = Math.min(page, totalPages)
    const visible = useMemo(() => data.slice((current - 1) * pageSize, current * pageSize), [data, current, pageSize])
    return <section className="data-table-panel"><div className="data-table-header">{title}</div><div className="data-table-body">{filters && <div className="data-table-filters">{filters}</div>}<div className="table-responsive"><table className="data-table-list"><thead><tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}{actions.length > 0 && <th className="data-table-actions-header">Acciones</th>}</tr></thead><tbody>{loading ? <tr><td colSpan={columns.length + 1} className="data-table-empty">Cargando…</td></tr> : visible.length === 0 ? <tr><td colSpan={columns.length + 1} className="data-table-empty">{emptyMessage}</td></tr> : visible.map((row, index) => <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? index}>{columns.map(column => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '-'}</td>)}{actions.length > 0 && <td className="data-table-actions">{actions.map((action, actionIndex) => <button key={actionIndex} type="button" className="data-table-btn" title={action.type} onClick={() => action.onClick(row)}><span>{icons[action.type] === 'bi-trash' ? '🗑' : '✎'}</span></button>)}</td>}</tr>)}</tbody></table></div><div className="data-table-footer"><span>{data.length} registros</span>{totalPages > 1 && <div className="data-table-pagination"><button disabled={current === 1} onClick={() => setPage(current - 1)}>Anterior</button><span>Página {current} de {totalPages}</span><button disabled={current === totalPages} onClick={() => setPage(current + 1)}>Siguiente</button></div>}</div></div></section>
}
