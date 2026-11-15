export const normalizarInstitucion = institucion => ({
    institucionCode: institucion?.institucionCode ?? institucion?.InstitucionCode ?? '',
    nombre: institucion?.nombre ?? institucion?.Nombre ?? ''
})

export const textoInstitucion = valor =>
    String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const mensajeErrorInstitucion = (
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
    if (estado === 404) return 'No se encontró la institución solicitada.'
    if (estado === 409) return 'Ya existe una institución con ese código.'
    if (estado >= 500) return 'Ocurrió un error interno. Inténtelo de nuevo más tarde.'

    return mensajePredeterminado
}
