import { normalizarFactura } from './facturaUtils'

export const ESTADOS_PAGO = ['Todos', 'Activo', 'Reversado']

export const normalizarPago = p => {
    const facturaRaw = p?.factura ?? p?.Factura
    const facturaNormalizada = facturaRaw ? normalizarFactura(facturaRaw) : null
    const idEstudiante =
        facturaNormalizada?.identificacionEstudiante ||
        p?.identificacionEstudiante ||
        p?.IdentificacionEstudiante ||
        ''

    return {
        pagoID: p?.pagoID ?? p?.pagoId ?? p?.PagoID ?? '',
        facturaID: p?.facturaID ?? p?.facturaId ?? p?.FacturaID ?? '',
        monto: Number(p?.monto ?? p?.Monto ?? 0),
        fechaPago: p?.fechaPago ?? p?.FechaPago ?? null,
        fechaReversion: p?.fechaReversion ?? p?.FechaReversion ?? null,
        motivoReversion: p?.motivoReversion ?? p?.MotivoReversion ?? '',
        estado: p?.estado ?? p?.Estado ?? 'Activo',
        factura: facturaNormalizada,
        identificacionEstudiante: idEstudiante
    }
}

export const formatearMoneda = valor => {
    const numero = Number(valor ?? 0)
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2
    }).format(Number.isFinite(numero) ? numero : 0)
}

export const formatearFecha = valor => {
    if (!valor) return '-'
    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime())
        ? '-'
        : fecha.toLocaleString('es-CR')
}

export const formatearNombrePeriodo = p => {
    if (!p) return '-'
    if (typeof p === 'string') return p
    const anio = p.anio ?? p.Anio
    const num = p.numeroPeriodo ?? p.NumeroPeriodo
    if (num && anio) {
        return `Periodo ${num} - ${anio}`
    }
    return p.descripcion || p.nombre || p.descripcionPeriodo || p.periodoID || '-'
}

export const normalizarTexto = valor =>
    String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const badgeEstadoPago = estado => {
    switch (estado) {
        case 'Activo':
            return 'success'
        case 'Reversado':
            return 'danger'
        default:
            return 'secondary'
    }
}

export const mensajeErrorPago = (
    error,
    mensajePredeterminado = 'No se pudo completar la operación.'
) => {
    const estado = error?.response?.status
    const datos = error?.response?.data
    const mensaje = datos?.mensaje ?? datos?.message

    if (mensaje) return mensaje
    if (estado === 400) return 'Los datos enviados no son válidos.'
    if (estado === 401) return 'No autorizado. Inicie sesión nuevamente.'
    if (estado === 403) return 'No tiene permisos para realizar esta operación.'
    if (estado === 404) return 'No se encontró el pago o factura solicitada.'
    if (estado === 409) return 'Conflicto: la factura ya está pagada o el pago ya se encuentra reversado.'
    if (estado >= 500) return 'Ocurrió un error interno en el servidor.'

    return mensajePredeterminado
}
