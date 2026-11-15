/**
 * Utilidades para el módulo de Notificaciones (ADM22 - MetaU)
 * Maneja validaciones de correo, sanitización de HTML y normalización para tablas.
 */

// Regex espejo de la constraint CH_Notificaciones_EmailDestino_Formato del backend y BD
export const EMAIL_REGEX = /^[^@.\s][^@\s]*@[^@.\s][^@\s]*\.[^@.\s]+$/;

/**
 * Valida un correo electrónico individual contra las reglas de MetaU.
 * @param {string} email
 * @returns {{ valido: boolean, error: string | null }}
 */
export const validarEmail = (email) => {
    const correo = String(email ?? '').trim();

    if (!correo) {
        return { valido: false, error: 'El correo no puede estar vacío.' };
    }
    if (correo.length < 7) {
        return { valido: false, error: `El correo "${correo}" debe tener al menos 7 caracteres.` };
    }
    if (correo.length > 150) {
        return { valido: false, error: `El correo "${correo}" supera el límite de 150 caracteres.` };
    }
    if (correo.includes('..')) {
        return { valido: false, error: `El correo "${correo}" contiene puntos consecutivos no permitidos.` };
    }
    if (/\s/.test(correo)) {
        return { valido: false, error: `El correo "${correo}" contiene espacios internos.` };
    }
    if (!EMAIL_REGEX.test(correo)) {
        return { valido: false, error: `El correo "${correo}" no tiene un formato válido.` };
    }

    return { valido: true, error: null };
};

/**
 * Procesa y valida uno o múltiples correos ingresados en una cadena de texto.
 * Soporta separadores: comas (,), punto y coma (;), saltos de línea o espacios.
 * @param {string} textoEmails
 * @returns {{
 *   valido: boolean,
 *   correosValidos: string[],
 *   correosInvalidos: { email: string, error: string }[],
 *   duplicados: string[],
 *   total: number
 * }}
 */
export const parsearYValidarEmails = (textoEmails) => {
    if (!textoEmails || typeof textoEmails !== 'string') {
        return {
            valido: false,
            correosValidos: [],
            correosInvalidos: [{ email: '', error: 'Debe ingresar al menos un correo de destino.' }],
            duplicados: [],
            total: 0
        };
    }

    // Separar por comas, punto y coma o saltos de línea
    const tokens = textoEmails
        .split(/[,;\n\r]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

    if (tokens.length === 0) {
        return {
            valido: false,
            correosValidos: [],
            correosInvalidos: [{ email: '', error: 'Debe ingresar al menos un correo de destino.' }],
            duplicados: [],
            total: 0
        };
    }

    const vistos = new Set();
    const duplicados = [];
    const correosValidos = [];
    const correosInvalidos = [];

    tokens.forEach(token => {
        const lower = token.toLowerCase();

        if (vistos.has(lower)) {
            if (!duplicados.includes(lower)) {
                duplicados.push(lower);
            }
            return;
        }

        vistos.add(lower);

        const res = validarEmail(token);
        if (res.valido) {
            correosValidos.push(token);
        } else {
            correosInvalidos.push({ email: token, error: res.error });
        }
    });

    const esValido = correosInvalidos.length === 0 && correosValidos.length > 0;

    return {
        valido: esValido,
        correosValidos,
        correosInvalidos,
        duplicados,
        total: correosValidos.length
    };
};

// Lista blanca de etiquetas HTML permitidas en el cuerpo del correo
const ETIQUETAS_PERMITIDAS = new Set([
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup', 'small',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'div', 'span', 'center',
    'a', 'img'
]);

// Lista blanca de atributos seguros
const ATRIBUTOS_PERMITIDOS = new Set([
    'style', 'class', 'title', 'width', 'height',
    'border', 'cellpadding', 'cellspacing', 'align', 'valign',
    'bgcolor', 'color', 'href', 'src', 'alt', 'target', 'rel'
]);

/**
 * Sanitiza contenido HTML para prevenir ataques XSS permitiendo formato seguro de correo.
 * Utiliza DOMParser del navegador para limpiar nodos de forma segura y determinística.
 * @param {string} html
 * @returns {string} HTML sanitizado
 */
export const sanitizarHTML = (html) => {
    if (!html || typeof html !== 'string') return '';

    // En navegadores: usar DOMParser para construir un DOM desacoplado
    if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const limpiarNodo = (nodo) => {
                const hijos = Array.from(nodo.childNodes);

                hijos.forEach(hijo => {
                    if (hijo.nodeType === Node.ELEMENT_NODE) {
                        const tag = hijo.tagName.toLowerCase();

                        // Si la etiqueta no está permitida, se remueve o se reemplaza por su texto
                        if (!ETIQUETAS_PERMITIDAS.has(tag)) {
                            hijo.remove();
                            return;
                        }

                        // Filtrar atributos peligrosos
                        const atributos = Array.from(hijo.attributes);
                        atributos.forEach(attr => {
                            const nombre = attr.name.toLowerCase();
                            const valor = attr.value.trim().toLowerCase();

                            // Bloquear cualquier evento inline (onclick, onload, onerror, etc.)
                            if (nombre.startsWith('on')) {
                                hijo.removeAttribute(attr.name);
                                return;
                            }

                            // Bloquear protocolos peligrosos
                            if ((nombre === 'href' || nombre === 'src') &&
                                (valor.startsWith('javascript:') || valor.startsWith('vbscript:') || valor.startsWith('data:text/html'))) {
                                hijo.removeAttribute(attr.name);
                                return;
                            }

                            // Sanitizar estilos en línea contra expression() o url(javascript)
                            if (nombre === 'style') {
                                if (/expression|javascript:|behavior/i.test(attr.value)) {
                                    hijo.removeAttribute(attr.name);
                                    return;
                                }
                            }

                            // Si el atributo no está en la lista blanca, removerlo
                            if (!ATRIBUTOS_PERMITIDOS.has(nombre)) {
                                hijo.removeAttribute(attr.name);
                            }
                        });

                        // Para links, forzar rel seguro
                        if (tag === 'a') {
                            hijo.setAttribute('target', '_blank');
                            hijo.setAttribute('rel', 'noopener noreferrer');
                        }

                        limpiarNodo(hijo);
                    } else if (hijo.nodeType === Node.COMMENT_NODE) {
                        hijo.remove();
                    }
                });
            };

            limpiarNodo(doc.body);
            return doc.body.innerHTML;
        } catch {
            // Fallback de contingencia si falla DOMParser
        }
    }

    // Fallback básico con regex para entornos sin DOMParser
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:[^"']*/gi, '');
};

/**
 * Normaliza una entidad de Notificación para alimentar componentes de tabla y detalles.
 * @param {object} n
 * @returns {object} Notificación normalizada
 */
export const normalizarNotificacion = (n) => ({
    notificacionID: n?.notificacionID ?? n?.NotificacionID ?? '',
    usuarioID: n?.usuarioID ?? n?.UsuarioID ?? '',
    emailDestino: n?.emailDestino ?? n?.EmailDestino ?? n?.email ?? '',
    plantillaNotificacionCode: n?.plantillaNotificacionCode ?? n?.PlantillaNotificacionCode ?? 'CUSTOM',
    asunto: n?.asunto ?? n?.Asunto ?? '',
    cuerpo: n?.cuerpo ?? n?.Cuerpo ?? '',
    fechaCreacion: n?.fechaCreacion ?? n?.FechaCreacion ?? null,
    fechaEnvio: n?.fechaEnvio ?? n?.FechaEnvio ?? null,
    estadoNotificacion: n?.estadoNotificacion ?? n?.EstadoNotificacion ?? n?.estado ?? 'PENDIENTE',
    estadoNombre: n?.estadoNombre ?? n?.EstadoNombre ?? '',
    mensajeError: n?.mensajeError ?? n?.MensajeError ?? '',
    numeroIntentos: Number(n?.numeroIntentos ?? n?.NumeroIntentos ?? 0),
    fechaUltimoIntento: n?.fechaUltimoIntento ?? n?.FechaUltimoIntento ?? null,
});

/**
 * Formatea una fecha ISO a la zona horaria y formato de Costa Rica.
 * @param {string | Date} valor
 * @returns {string} Fecha legible
 */
export const formatearFecha = (valor) => {
    if (!valor) return '-';
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime())
        ? '-'
        : fecha.toLocaleString('es-CR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
};

/**
 * Estados disponibles para filtrado en la interfaz.
 */
export const ESTADOS_NOTIFICACION = ['Todos', 'ENVIADO', 'PENDIENTE', 'ERROR', 'CANCELADO'];

/**
 * Retorna las propiedades de estilo visual y texto para el badge de estado.
 * @param {string} estado
 * @returns {{ className: string, label: string }}
 */
export const obtenerBadgeEstado = (estado) => {
    const est = String(estado ?? '').toUpperCase();
    switch (est) {
        case 'ENVIADO':
            return { className: 'badge bg-success', label: 'Enviado' };
        case 'PENDIENTE':
            return { className: 'badge bg-warning text-dark', label: 'Pendiente' };
        case 'ERROR':
            return { className: 'badge bg-danger', label: 'Error' };
        case 'CANCELADO':
            return { className: 'badge bg-secondary', label: 'Cancelado' };
        default:
            return { className: 'badge bg-secondary', label: estado || 'Desconocido' };
    }
};

/**
 * Normaliza texto para filtros de búsqueda insensible a mayúsculas y acentos.
 * @param {string} valor
 * @returns {string}
 */
export const textoBusqueda = (valor) =>
    String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
