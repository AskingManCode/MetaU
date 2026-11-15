
import { useEffect, useState } from 'react'
import { Form, Modal } from 'react-bootstrap'

const nuevoRubro = () => ({
    nombreRubro: '',
    porcentaje: ''
})

export default function Create({
    show,
    tipo,
    modo = 'crear',
    grupoCode,
    identificacion,
    rubro,
    rubrosActuales = [],
    guardando,
    onClose,
    onGuardar
}) {
    const [rubrosFormulario, setRubrosFormulario] = useState([
        nuevoRubro()
    ])
    const [valorNota, setValorNota] = useState('')

    useEffect(() => {
        if (!show) return

        if (modo === 'editar' && tipo === 'desglose') {
            setRubrosFormulario(
                rubrosActuales.map(r => ({
                    nombreRubro: r.nombreRubro,
                    porcentaje: String(r.porcentaje)
                }))
            )
        } else {
            setRubrosFormulario([nuevoRubro()])
        }

        setValorNota(
            modo === 'editar' && rubro?.notaActual != null
                ? String(rubro.notaActual)
                : ''
        )
    }, [show, tipo, modo, rubrosActuales, rubro])

    const esDesglose = tipo === 'desglose'
    const esEdicion = modo === 'editar'

    const titulo = esDesglose
        ? esEdicion
            ? 'Modificar desglose'
            : 'Cargar desglose'
        : esEdicion
            ? 'Modificar nota'
            : 'Asignar nota'

    const total = rubrosFormulario.reduce(
        (suma, item) =>
            suma + (Number(item.porcentaje) || 0),
        0
    )

    const nombres = rubrosFormulario.map(item =>
        item.nombreRubro.trim().replace(/\s+/g, ' ').toLowerCase()
    )

    const rubrosValidos =
        rubrosFormulario.length > 0 &&
        rubrosFormulario.every(item =>
            item.nombreRubro.trim() &&
            String(item.porcentaje).trim() !== '' &&
            Number.isFinite(Number(item.porcentaje)) &&
            Number(item.porcentaje) > 0
        ) &&
        new Set(nombres).size === nombres.length &&
        Math.abs(total - 100) < 0.000001

    const notaValida =
        String(valorNota).trim() !== '' &&
        Number.isFinite(Number(valorNota)) &&
        Number(valorNota) >= 1 &&
        Number(valorNota) <= 100

    const agregarRubro = () => {
        setRubrosFormulario(actual => [
            ...actual,
            nuevoRubro()
        ])
    }

    const actualizarRubro = (indice, campo, valor) => {
        setRubrosFormulario(actual =>
            actual.map((item, i) =>
                i === indice
                    ? { ...item, [campo]: valor }
                    : item
            )
        )
    }

    const eliminarRubro = indice => {
        setRubrosFormulario(actual =>
            actual.filter((_, i) => i !== indice)
        )
    }

    const guardar = async e => {
        e.preventDefault()

        if (guardando) return

        let correcto = false

        if (esDesglose) {
            if (!rubrosValidos) return
            correcto = await onGuardar(rubrosFormulario)
        } else {
            if (!notaValida || !rubro?.rubroID) return

            correcto = await onGuardar(
                rubro.rubroID,
                valorNota
            )
        }

        if (correcto) {
            onClose()
        }
    }

    return (
        <Modal
            show={show}
            onHide={() => {
                if (!guardando) onClose()
            }}
            centered
            size={esDesglose ? 'lg' : undefined}
            backdrop={guardando ? 'static' : true}
        >
            <Form onSubmit={guardar}>
                <Modal.Header closeButton={!guardando}>
                    <Modal.Title>{titulo}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {esDesglose ? (
                        <>
                            <p className="text-muted small">
                                Grupo: {grupoCode}
                            </p>

                            <p className="text-muted small">
                                Los porcentajes deben sumar 100
                                y los nombres no pueden repetirse
                            </p>

                            {rubrosFormulario.map((item, indice) => (
                                <div
                                    className="row g-2 align-items-end mb-2"
                                    key={indice}
                                >
                                    <div className="col-md-7">
                                        <Form.Label className="small mb-1">
                                            Nombre del rubro
                                        </Form.Label>

                                        <Form.Control
                                            size="sm"
                                            value={item.nombreRubro}
                                            onChange={e =>
                                                actualizarRubro(
                                                    indice,
                                                    'nombreRubro',
                                                    e.target.value
                                                )
                                            }
                                            required
                                            disabled={guardando}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <Form.Label className="small mb-1">
                                            Porcentaje
                                        </Form.Label>

                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            min="0.01"
                                            max="100"
                                            step="0.01"
                                            value={item.porcentaje}
                                            onChange={e =>
                                                actualizarRubro(
                                                    indice,
                                                    'porcentaje',
                                                    e.target.value
                                                )
                                            }
                                            required
                                            disabled={guardando}
                                        />
                                    </div>

                                    <div className="col-md-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger w-100"
                                            title="Eliminar rubro"
                                            onClick={() =>
                                                eliminarRubro(indice)
                                            }
                                            disabled={
                                                guardando ||
                                                rubrosFormulario.length === 1
                                            }
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={agregarRubro}
                                    disabled={guardando}
                                >
                                    <i className="bi bi-plus-lg me-2" />
                                    Agregar rubro
                                </button>

                                <span
                                    className={
                                        Math.abs(total - 100) < 0.000001
                                            ? 'text-success fw-semibold'
                                            : 'text-danger fw-semibold'
                                    }
                                >
                                    Total: {total.toFixed(2)}%
                                </span>
                            </div>

                            {esEdicion && (
                                <small className="text-muted d-block mt-3">
                                    Guardar reemplazara el desglose anterior
                                    solamente si no existen notas asignadas
                                    al grupo
                                </small>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="mb-3">
                                <Form.Label className="small mb-1">
                                    Identificacion del estudiante
                                </Form.Label>

                                <Form.Control
                                    size="sm"
                                    value={identificacion}
                                    readOnly
                                />
                            </div>

                            <div className="mb-3">
                                <Form.Label className="small mb-1">
                                    Rubro
                                </Form.Label>

                                <Form.Control
                                    size="sm"
                                    value={rubro?.nombreRubro ?? ''}
                                    readOnly
                                />
                            </div>

                            <Form.Label className="small mb-1">
                                Nota obtenida
                            </Form.Label>

                            <Form.Control
                                size="sm"
                                type="number"
                                min="1"
                                max="100"
                                step="0.01"
                                value={valorNota}
                                onChange={e =>
                                    setValorNota(e.target.value)
                                }
                                required
                                disabled={guardando}
                            />

                            <small className="text-muted d-block mt-2">
                                Ingrese una nota entre 1 y 100
                            </small>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onClose}
                        disabled={guardando}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn btn-sm btn-primary"
                        disabled={
                            guardando ||
                            (esDesglose ? !rubrosValidos : !notaValida)
                        }
                    >
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
