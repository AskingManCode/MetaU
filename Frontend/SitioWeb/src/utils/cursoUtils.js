export const normalizarCurso = curso => ({
    cursoCode: curso?.cursoCode ?? curso?.CursoCode ?? '',
    carreraCode: curso?.carreraCode ?? curso?.CarreraCode ?? '',
    nombre: curso?.nombre ?? curso?.Nombre ?? '',
    nivel: curso?.nivel ?? curso?.Nivel ?? ''
})

export const normalizarCarreraCurso = carrera => ({
    carreraCode: carrera?.carreraCode ?? carrera?.CarreraCode ?? '',
    nombre: carrera?.nombre ?? carrera?.Nombre ?? ''
})

export const textoBusquedaCurso = valor =>
    String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const mensajeErrorCurso = (
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
    if (estado === 404) return 'No se encontró el curso solicitado.'
    if (estado === 409) return 'Ya existe un curso con ese código.'
    if (estado >= 500) return 'Ocurrió un error interno. Inténtelo de nuevo más tarde.'

    return error?.message?.startsWith('No se pudo verificar')
        ? error.message
        : mensajePredeterminado
}
