
import { Button, Modal } from 'react-bootstrap'
import { obtenerAccion } from '../hooks/useBitacoras'

const formatearJSON = texto => {
    try {
        return JSON.stringify(JSON.parse(texto), null, 2)
    } catch {
        return texto
    }
}

const obtenerDetalles = descripcion => {
    const texto = String(descripcion ?? '')
    const anterior = texto.match(/anterior\s*=/i)
    const actual = texto.match(/,\s*actual\s*=/i)

    if (anterior && actual && actual.index > anterior.index) {
        return [
            { titulo: 'Operacion', contenido: texto.slice(0, anterior.index).trim() },
            { titulo: 'Registro anterior', contenido: formatearJSON(texto.slice(anterior.index + anterior[0].length, actual.index).trim()) },
            { titulo: 'Registro actual', contenido: formatearJSON(texto.slice(actual.index + actual[0].length).trim()) }
        ]
    }

    const inicioJSON = texto.search(/[\[{]/)

    if (inicioJSON >= 0) {
        return [
            { titulo: 'Operacion', contenido: texto.slice(0, inicioJSON).trim() },
            { titulo: 'Detalle', contenido: formatearJSON(texto.slice(inicioJSON).trim()) }
        ]
    }

    return [{ titulo: 'Descripcion', contenido: texto }]
}

export default function BitacoraDetalle({ bitacora, onClose }) {
    const detalles = bitacora ? obtenerDetalles(bitacora.descripcion) : []

    return (
        <Modal show={!!bitacora} onHide={onClose} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">Detalle de Bitacora</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {bitacora && (
                    <>
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <small className="text-muted">ID</small>
                                <div>{bitacora.idBitacora}</div>
                            </div>

                            <div className="col-md-8">
                                <small className="text-muted">Fecha</small>
                                <div>{bitacora.fechaBitacora ? new Date(bitacora.fechaBitacora).toLocaleString('es-CR') : '-'}</div>
                            </div>

                            <div className="col-md-8">
                                <small className="text-muted">Usuario</small>
                                <div className="text-break">{bitacora.usuario}</div>
                            </div>

                            <div className="col-md-4">
                                <small className="text-muted">Accion</small>
                                <div>{obtenerAccion(bitacora.descripcion)}</div>
                            </div>
                        </div>

                        {detalles.map((detalle, index) => (
                            <div className="mb-3" key={index}>
                                <div className="fw-semibold mb-2">{detalle.titulo}</div>
                                <pre className="bg-light border rounded p-3 small mb-0" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{detalle.contenido || '-'}</pre>
                            </div>
                        ))}
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    )
}
