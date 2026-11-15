import { useMemo, useState } from 'react'
import { Badge, ButtonGroup, Card, Dropdown, Form, Nav, Spinner } from 'react-bootstrap'
import Notification from '../../../components/Notification'
import PageHeader from '../../../components/PageHeader'
import { parsearYValidarEmails, sanitizarHTML } from '../../../utils/notificacionUtils'

const estiloBoton = {
    width: '38px',
    height: '38px',
    backgroundColor: '#5d75e5',
    borderColor: '#5d75e5'
}

const MAX_ASUNTO = 200

const PLANTILLA_FORMAL = `<p>Estimado(a) estudiante / funcionario(a),</p>
<p>Por medio de la presente, la administración de <strong>MetaU</strong> le informa lo siguiente:</p>
<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #1e40af;">
  <strong>Asunto Importante:</strong> Ingrese aquí el detalle del comunicado institucional...
</div>
<p>Agradecemos su atención a la presente comunicación.</p>
<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
<p style="font-size: 0.85rem; color: #64748b; margin-bottom: 0;">
  Atentamente,<br />
  <strong>Administración MetaU</strong><br />
  <em>Colegio Universitario de Cartago (CUC)</em>
</p>`

const PLANTILLA_RECORDATORIO = `<p>Estimado(a) estudiante,</p>
<p>Le recordamos la fecha límite para completar su trámite académico o administrativo correspondiente al periodo lectivo actual:</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;" border="1" cellpadding="8">
  <thead>
    <tr style="background-color: #f1f5f9; text-align: left;">
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Concepto / Trámite</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Fecha Límite</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1;">Estado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Matrícula / Arancel</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Próximo cierre</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; color: #d97706; font-weight: bold;">Pendiente</td>
    </tr>
  </tbody>
</table>
<div style="text-align: center; margin: 20px 0;">
  <a href="https://metau.cuc.cr" target="_blank" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
    Acceder al Sistema MetaU
  </a>
</div>
<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 18px 0;" />
<p style="font-size: 0.85rem; color: #64748b;">Departamento Administrativo - MetaU</p>`

const PLANTILLA_URGENTE = `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0; border-radius: 4px; color: #991b1b;">
  <h3 style="margin-top: 0; color: #991b1b;">Aviso Urgente: Mantenimiento de Plataforma</h3>
  <p style="margin-bottom: 0;">Se informa que los servicios de la plataforma institucional estarán temporalmente suspendidos:</p>
</div>
<ul>
  <li><strong>Fecha programada:</strong> Sábado 15 de Noviembre</li>
  <li><strong>Horario:</strong> 10:00 PM - 02:00 AM</li>
  <li><strong>Servicios afectados:</strong> Matrícula en línea y Portal de Notas</li>
</ul>
<p>Recomendamos tomar las previsiones correspondientes para evitar contratiempos.</p>`

export default function NotificacionForm({
    titulo = 'Enviar Notificación',
    onSolicitarEnvio,
    onCancelar,
    enviando = false
}) {
    const [rawEmails, setRawEmails] = useState('')
    const [asunto, setAsunto] = useState('')
    const [cuerpo, setCuerpo] = useState('')
    const [modoVista, setModoVista] = useState('editor') // 'editor' | 'preview'
    const [tocado, setTocado] = useState(false)
    const [notification, setNotification] = useState(null)

    // Validación reactiva de correos
    const analisisEmails = useMemo(() => {
        return parsearYValidarEmails(rawEmails)
    }, [rawEmails])

    // Sanitización reactiva para vista previa
    const cuerpoSanitizado = useMemo(() => {
        return sanitizarHTML(cuerpo)
    }, [cuerpo])

    // Validación general del formulario
    const asuntoValido = asunto.trim().length > 0 && asunto.length <= MAX_ASUNTO
    const cuerpoValido = cuerpo.trim().length > 0
    const formularioValido = analisisEmails.valido && asuntoValido && cuerpoValido

    // Insertar etiquetas HTML en la posición del cursor
    const insertarEtiqueta = (apertura, cierre = '') => {
        const textarea = document.getElementById('cuerpo-html-textarea')
        if (!textarea) {
            setCuerpo(prev => prev + apertura + cierre)
            return
        }

        const inicio = textarea.selectionStart
        const fin = textarea.selectionEnd
        const textoSeleccionado = cuerpo.substring(inicio, fin)
        const nuevoTexto =
            cuerpo.substring(0, inicio) +
            apertura +
            (textoSeleccionado || '') +
            cierre +
            cuerpo.substring(fin)

        setCuerpo(nuevoTexto)
        setTimeout(() => {
            textarea.focus()
            const pos = textoSeleccionado
                ? inicio + apertura.length + textoSeleccionado.length + cierre.length
                : inicio + apertura.length
            textarea.setSelectionRange(pos, pos)
        }, 50)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setTocado(true)

        if (!analisisEmails.valido) {
            setNotification({
                type: 'error',
                message: analisisEmails.correosInvalidos[0]?.error || 'Debe ingresar al menos un correo de destino válido.'
            })
            return
        }

        if (!asuntoValido) {
            setNotification({
                type: 'error',
                message: 'El asunto es obligatorio y no puede superar los 200 caracteres.'
            })
            return
        }

        if (!cuerpoValido) {
            setNotification({
                type: 'error',
                message: 'El cuerpo de la notificación es obligatorio.'
            })
            return
        }

        if (enviando) return

        setNotification(null)

        onSolicitarEnvio({
            correos: analisisEmails.correosValidos,
            asunto: asunto.trim(),
            cuerpo: cuerpoSanitizado
        })
    }

    const eliminarCorreo = (correoAEliminar) => {
        const nuevos = analisisEmails.correosValidos
            .filter(c => c.toLowerCase() !== correoAEliminar.toLowerCase())
        setRawEmails(nuevos.join(', '))
    }

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <PageHeader title={titulo} />

            <div className="d-flex gap-2 mb-3">
                {onCancelar && (
                    <button
                        type="button"
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={estiloBoton}
                        onClick={onCancelar}
                        disabled={enviando}
                        title="Volver al listado"
                        aria-label="Volver al listado"
                    >
                        <i className="bi bi-arrow-left fs-5" />
                    </button>
                )}

                <button
                    type="submit"
                    form="formularioNotificacion"
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={estiloBoton}
                    disabled={enviando}
                    title="Guardar"
                    aria-label="Guardar"
                >
                    {enviando ? <Spinner animation="border" size="sm" /> : <i className="bi bi-floppy fs-5" />}
                </button>
            </div>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light border-bottom py-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <span className="text-primary fw-semibold">Información de la Notificación</span>
                        <small className="text-muted">Todos los campos marcados con * son obligatorios</small>
                    </div>
                </Card.Header>

                <Card.Body className="p-3">
                    <Form id="formularioNotificacion" noValidate onSubmit={handleSubmit}>
                        <fieldset disabled={enviando} className="border-0 p-0 m-0 w-100">
                    {/* Campo Destinatario(s) */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <Form.Label className="fw-semibold mb-0">
                                Destinatario(s) <span className="text-danger">*</span>
                            </Form.Label>
                            {analisisEmails.total > 0 && (
                                <Badge bg="success" className="px-2 py-1">
                                    <i className="bi bi-check-circle me-1" />
                                    {analisisEmails.total} destinatario{analisisEmails.total !== 1 ? 's' : ''} válido{analisisEmails.total !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>

                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Ingrese uno o varios correos separados por comas, punto y coma o saltos de línea (ej: usuario@cuc.cr, profesor@cuc.ac.cr)..."
                            value={rawEmails}
                            onChange={(e) => setRawEmails(e.target.value)}
                            onBlur={() => setTocado(true)}
                            isInvalid={tocado && !analisisEmails.valido}
                            disabled={enviando}
                        />

                        {/* Chips de correos validados */}
                        {analisisEmails.correosValidos.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mt-2">
                                {analisisEmails.correosValidos.map(correo => (
                                    <Badge
                                        key={correo}
                                        bg="primary-subtle"
                                        text="primary"
                                        className="d-inline-flex align-items-center gap-1 border border-primary-subtle py-1 px-2"
                                    >
                                        <i className="bi bi-envelope-at" />
                                        <span>{correo}</span>
                                        {!enviando && (
                                            <button
                                                type="button"
                                                className="btn-close btn-close-sm ms-1"
                                                aria-label="Eliminar"
                                                style={{ fontSize: '0.65rem' }}
                                                onClick={() => eliminarCorreo(correo)}
                                            />
                                        )}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Alertas de errores en correos */}
                        {tocado && analisisEmails.correosInvalidos.length > 0 && (
                            <div className="mt-2 text-danger small">
                                {analisisEmails.correosInvalidos.map((err, idx) => (
                                    <div key={idx} className="d-flex align-items-center gap-1">
                                        <i className="bi bi-exclamation-circle-fill" />
                                        <span>{err.error}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analisisEmails.duplicados.length > 0 && (
                            <div className="mt-1 text-warning small d-flex align-items-center gap-1">
                                <i className="bi bi-info-circle-fill" />
                                <span>Se omitieron {analisisEmails.duplicados.length} correo(s) duplicado(s).</span>
                            </div>
                        )}
                    </div>

                    {/* Campo Asunto */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <Form.Label className="fw-semibold mb-0">
                                Asunto <span className="text-danger">*</span>
                            </Form.Label>
                            <small className={`text-muted ${asunto.length > MAX_ASUNTO ? 'text-danger fw-bold' : ''}`}>
                                {asunto.length} / {MAX_ASUNTO} caracteres
                            </small>
                        </div>
                        <Form.Control
                            type="text"
                            placeholder="Escriba el asunto de la notificación..."
                            value={asunto}
                            maxLength={MAX_ASUNTO}
                            onChange={(e) => setAsunto(e.target.value)}
                            onBlur={() => setTocado(true)}
                            isInvalid={tocado && !asuntoValido}
                            disabled={enviando}
                        />
                        {tocado && !asuntoValido && (
                            <Form.Control.Feedback type="invalid">
                                El asunto es obligatorio y no puede superar los 200 caracteres.
                            </Form.Control.Feedback>
                        )}
                    </div>

                    {/* Campo Cuerpo (HTML permitido, sanitizado) */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Form.Label className="fw-semibold mb-0">
                                Cuerpo del Mensaje (HTML permitido) <span className="text-danger">*</span>
                            </Form.Label>

                            {/* Pestañas de modo: Editor vs Vista Previa */}
                            <Nav variant="pills" className="small" activeKey={modoVista} onSelect={(k) => setModoVista(k)}>
                                <Nav.Item>
                                    <Nav.Link eventKey="editor" className="py-1 px-3">
                                        <i className="bi bi-code-slash me-1" />
                                        Editor HTML
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="preview" className="py-1 px-3">
                                        <i className="bi bi-eye me-1" />
                                        Vista Previa Sanitizada
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>

                        {modoVista === 'editor' ? (
                            <>
                                {/* Barra de herramientas enriquecida HTML */}
                                <div className="p-2 bg-light border rounded-top border-bottom-0 d-flex flex-wrap align-items-center gap-1">
                                    {/* Formato básico */}
                                    <ButtonGroup size="sm">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Párrafo <p>"
                                            onClick={() => insertarEtiqueta('<p>', '</p>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-paragraph" /> P
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm fw-bold"
                                            title="Negrita <strong>"
                                            onClick={() => insertarEtiqueta('<strong>', '</strong>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-type-bold" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm fst-italic"
                                            title="Cursiva <em>"
                                            onClick={() => insertarEtiqueta('<em>', '</em>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-type-italic" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm text-decoration-underline"
                                            title="Subrayado <u>"
                                            onClick={() => insertarEtiqueta('<u>', '</u>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-type-underline" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm text-decoration-line-through"
                                            title="Tachado <s>"
                                            onClick={() => insertarEtiqueta('<s>', '</s>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-type-strikethrough" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Resaltado <mark>"
                                            onClick={() => insertarEtiqueta('<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 3px;">', '</mark>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-highlighter" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm font-monospace"
                                            title="Código <code>"
                                            onClick={() => insertarEtiqueta('<code style="background-color: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace;">', '</code>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-code" />
                                        </button>
                                    </ButtonGroup>

                                    {/* Encabezados */}
                                    <ButtonGroup size="sm">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm fw-bold"
                                            title="Encabezado H1"
                                            onClick={() => insertarEtiqueta('<h1>', '</h1>')}
                                            disabled={enviando}
                                        >
                                            H1
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm fw-bold"
                                            title="Encabezado H2"
                                            onClick={() => insertarEtiqueta('<h2>', '</h2>')}
                                            disabled={enviando}
                                        >
                                            H2
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm fw-bold"
                                            title="Encabezado H3"
                                            onClick={() => insertarEtiqueta('<h3>', '</h3>')}
                                            disabled={enviando}
                                        >
                                            H3
                                        </button>
                                    </ButtonGroup>

                                    {/* Alineación */}
                                    <ButtonGroup size="sm">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Alinear a la izquierda"
                                            onClick={() => insertarEtiqueta('<div style="text-align: left;">', '</div>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-text-left" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Centrar texto"
                                            onClick={() => insertarEtiqueta('<div style="text-align: center;">', '</div>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-text-center" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Alinear a la derecha"
                                            onClick={() => insertarEtiqueta('<div style="text-align: right;">', '</div>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-text-right" />
                                        </button>
                                    </ButtonGroup>

                                    {/* Listas y citas */}
                                    <ButtonGroup size="sm">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Lista con viñetas"
                                            onClick={() => insertarEtiqueta('<ul>\n  <li>', '</li>\n  <li>Elemento 2</li>\n</ul>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-list-ul" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Lista numerada"
                                            onClick={() => insertarEtiqueta('<ol>\n  <li>', '</li>\n  <li>Paso 2</li>\n</ol>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-list-ol" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Cita / Bloque destacado"
                                            onClick={() => insertarEtiqueta('<blockquote style="border-left: 4px solid #3b82f6; padding-left: 12px; margin: 12px 0; color: #475569; font-style: italic;">', '</blockquote>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-quote" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Línea divisoria horizontal <hr>"
                                            onClick={() => insertarEtiqueta('<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 18px 0;" />')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-hr" />
                                        </button>
                                    </ButtonGroup>

                                    {/* Inserciones avanzadas */}
                                    <ButtonGroup size="sm">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Tabla formateada"
                                            onClick={() => insertarEtiqueta('<table style="width: 100%; border-collapse: collapse; margin: 12px 0;" border="1" cellpadding="8">\n  <thead>\n    <tr style="background-color: #f1f5f9; text-align: left;">\n      <th style="padding: 8px; border: 1px solid #cbd5e1;">Columna 1</th>\n      <th style="padding: 8px; border: 1px solid #cbd5e1;">Columna 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style="padding: 8px; border: 1px solid #cbd5e1;">Dato 1</td>\n      <td style="padding: 8px; border: 1px solid #cbd5e1;">Dato 2</td>\n    </tr>\n  </tbody>\n</table>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-table" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Enlace web"
                                            onClick={() => insertarEtiqueta('<a href="https://" target="_blank" style="color: #2563eb; text-decoration: underline;">', '</a>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-link-45deg" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            title="Botón de Acción (Call to Action)"
                                            onClick={() => insertarEtiqueta('<div style="text-align: center; margin: 20px 0;">\n  <a href="https://" target="_blank" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">\n    Texto del Botón\n  </a>\n</div>')}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-box-arrow-up-right me-1" /> Botón
                                        </button>
                                    </ButtonGroup>

                                    {/* Menú de Colores de Texto */}
                                    <Dropdown as={ButtonGroup} size="sm">
                                        <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-colores" disabled={enviando} title="Color de texto">
                                            <i className="bi bi-palette-fill me-1" /> Color
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="shadow-sm">
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<span style="color: #1e3a8a;">', '</span>')}>
                                                <span className="d-inline-block rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: '#1e3a8a' }} />
                                                Azul Institucional
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<span style="color: #16a34a;">', '</span>')}>
                                                <span className="d-inline-block rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: '#16a34a' }} />
                                                Verde Éxito
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<span style="color: #dc2626;">', '</span>')}>
                                                <span className="d-inline-block rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: '#dc2626' }} />
                                                Rojo / Urgente
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<span style="color: #ea580c;">', '</span>')}>
                                                <span className="d-inline-block rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: '#ea580c' }} />
                                                Naranja / Alerta
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<span style="color: #64748b;">', '</span>')}>
                                                <span className="d-inline-block rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: '#64748b' }} />
                                                Gris Secundario
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    {/* Menú de Cajas de Aviso / Alertas */}
                                    <Dropdown as={ButtonGroup} size="sm">
                                        <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-avisos" disabled={enviando} title="Cajas de aviso destacadas">
                                            <i className="bi bi-info-circle me-1" /> Cajas de Aviso
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="shadow-sm">
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 14px 0; border-radius: 4px; color: #1e40af;">\n  <strong>Información:</strong> ', '\n</div>')}>
                                                <span className="text-primary fw-semibold">ℹ Información (Azul)</span>
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; margin: 14px 0; border-radius: 4px; color: #854d0e;">\n  <strong>Importante:</strong> ', '\n</div>')}>
                                                <span className="text-warning fw-semibold">⚠ Advertencia (Amarillo)</span>
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 14px 0; border-radius: 4px; color: #166534;">\n  <strong>Éxito:</strong> ', '\n</div>')}>
                                                <span className="text-success fw-semibold">✔ Confirmación (Verde)</span>
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta('<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 14px 0; border-radius: 4px; color: #991b1b;">\n  <strong>Urgente:</strong> ', '\n</div>')}>
                                                <span className="text-danger fw-semibold">✖ Urgente / Error (Rojo)</span>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    {/* Menú de Plantillas Rápidas */}
                                    <Dropdown as={ButtonGroup} size="sm">
                                        <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-plantillas" disabled={enviando} title="Plantillas predefinidas de correo">
                                            <i className="bi bi-file-earmark-text me-1" /> Plantillas
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="shadow-sm">
                                            <Dropdown.Item onClick={() => insertarEtiqueta(PLANTILLA_FORMAL)}>
                                                <i className="bi bi-envelope me-2 text-primary" />
                                                Comunicado Institucional
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta(PLANTILLA_RECORDATORIO)}>
                                                <i className="bi bi-calendar-event me-2 text-warning" />
                                                Recordatorio con Tabla y Botón
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => insertarEtiqueta(PLANTILLA_URGENTE)}>
                                                <i className="bi bi-exclamation-octagon me-2 text-danger" />
                                                Aviso Urgente / Mantenimiento
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    {/* Botón de limpiar cuerpo rápido */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm ms-auto"
                                        title="Borrar contenido del cuerpo"
                                        onClick={() => setCuerpo('')}
                                        disabled={enviando || !cuerpo}
                                    >
                                        <i className="bi bi-trash" />
                                    </button>
                                </div>

                                <Form.Control
                                    id="cuerpo-html-textarea"
                                    as="textarea"
                                    rows={10}
                                    className="rounded-top-0 border-top-0"
                                    placeholder="<p>Estimado usuario, le informamos que...</p>"
                                    value={cuerpo}
                                    onChange={(e) => setCuerpo(e.target.value)}
                                    onBlur={() => setTocado(true)}
                                    isInvalid={tocado && !cuerpoValido}
                                    disabled={enviando}
                                    style={{ fontFamily: 'Consolas, monospace', fontSize: '0.9rem' }}
                                />
                                {tocado && !cuerpoValido && (
                                    <Form.Control.Feedback type="invalid">
                                        El cuerpo de la notificación es obligatorio.
                                    </Form.Control.Feedback>
                                )}
                            </>
                        ) : (
                            /* Vista Previa Sanitizada */
                            <div className="border rounded bg-light p-3">
                                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <span className="small text-muted fw-semibold">
                                        <i className="bi bi-shield-check text-success me-1" />
                                        Vista Previa Sanitizada (Sin scripts maliciosos)
                                    </span>
                                    <Badge bg="info-subtle" text="info" className="border border-info-subtle">
                                        HTML Seguro
                                    </Badge>
                                </div>
                                <div
                                    className="p-3 bg-white rounded border shadow-sm"
                                    style={{ minHeight: '180px', maxHeight: '350px', overflowY: 'auto' }}
                                    dangerouslySetInnerHTML={{
                                        __html: cuerpoSanitizado || '<em class="text-muted">Escriba el cuerpo en el editor para previsualizarlo aquí...</em>'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                        </fieldset>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}
