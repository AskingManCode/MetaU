export const ESTADOS_FACTURA = ['Todos', 'Pendiente de Cobro', 'Pagada', 'Anulada']

export const normalizarDetalleFactura = d => ({
    detalleFacturaID: d?.detalleFacturaID ?? d?.DetalleFacturaID ?? 0,
    descripcion: d?.descripcion ?? d?.Descripcion ?? 'Servicios estudiantiles',
    cursoCode: d?.cursoCode ?? d?.CursoCode ?? '',
    monto: Number(d?.monto ?? d?.Monto ?? 0)
})

export const normalizarFactura = f => ({
    facturaID: f?.facturaID ?? f?.FacturaID ?? '',
    identificacionEstudiante: f?.identificacionEstudiante ?? f?.IdentificacionEstudiante ?? '',
    matriculaID: f?.matriculaID ?? f?.MatriculaID ?? '',
    periodoID: f?.periodoID ?? f?.PeriodoID ?? '',
    estado: f?.estado ?? f?.Estado ?? 'Pendiente de Cobro',
    fechaEmision: f?.fechaEmision ?? f?.FechaEmision ?? null,
    fechaAnulacion: f?.fechaAnulacion ?? f?.FechaAnulacion ?? null,
    motivoAnulacion: f?.motivoAnulacion ?? f?.MotivoAnulacion ?? '',
    subtotal: Number(f?.subtotal ?? f?.Subtotal ?? 0),
    porcentajeImpuesto: Number(f?.porcentajeImpuesto ?? f?.PorcentajeImpuesto ?? 2),
    impuesto: Number(f?.impuesto ?? f?.Impuesto ?? 0),
    total: Number(f?.total ?? f?.Total ?? 0),
    detalles: Array.isArray(f?.detalles ?? f?.Detalles)
        ? (f.detalles ?? f.Detalles).map(normalizarDetalleFactura)
        : []
})

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

export const badgeEstadoFactura = estado => {
    switch (estado) {
        case 'Pendiente de Cobro':
            return 'warning'
        case 'Pagada':
            return 'success'
        case 'Anulada':
            return 'danger'
        default:
            return 'secondary'
    }
}

export const mensajeErrorFactura = (
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
    if (estado === 404) return 'No se encontró la factura solicitada.'
    if (estado === 409) return 'Conflicto: la factura ya se encuentra anulada o ya existe para esta matrícula.'
    if (estado >= 500) return 'Ocurrió un error interno en el servidor.'

    return mensajePredeterminado
}
