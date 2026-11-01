export const normalizarNombreInstitucion = nombre =>
    String(nombre ?? '').trim().replace(/ +/g, ' ')

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

    if (estado === 500) {
        return 'Ocurrió un error interno. Inténtelo de nuevo más tarde.'
    }

    if ([400, 404, 409].includes(estado)) {
        return datos?.mensaje || datos?.message || mensajePredeterminado
    }

    return datos?.mensaje || datos?.message || mensajePredeterminado
}
