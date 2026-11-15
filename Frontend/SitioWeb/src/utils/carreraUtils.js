export const normalizarTextoCarrera = valor =>
    String(valor ?? '').trim().replace(/ +/g, ' ')

export const textoBusquedaCarrera = valor =>
    String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const normalizarCarrera = carrera => ({
    carreraCode: carrera?.carreraCode ?? carrera?.CarreraCode ?? '',
    institucionCode: carrera?.institucionCode ?? carrera?.InstitucionCode ?? '',
    directorID:
        carrera?.directorID ??
        carrera?.directorId ??
        carrera?.DirectorID ??
        '',
    nombre: carrera?.nombre ?? carrera?.Nombre ?? ''
})

export const normalizarInstitucion = institucion => ({
    institucionCode:
        institucion?.institucionCode ??
        institucion?.InstitucionCode ??
        '',
    nombre: institucion?.nombre ?? institucion?.Nombre ?? ''
})

export const normalizarProfesor = profesor => ({
    profesorID:
        profesor?.profesorID ??
        profesor?.profesorId ??
        profesor?.ProfesorID ??
        '',
    nombreCompleto:
        profesor?.nombreCompleto ??
        profesor?.NombreCompleto ??
        '',
    identificacion:
        profesor?.identificacion ??
        profesor?.Identificacion ??
        ''
})

export const mensajeErrorCarrera = (
    error,
    predeterminado = 'No se pudo completar la operación.'
) => {
    const estado = error?.response?.status
    const datos = error?.response?.data
    const mensaje = datos?.mensaje ?? datos?.message

    if (mensaje) return mensaje
    if (estado === 400) return 'Los datos enviados no son válidos.'
    if (estado === 401) return 'No autorizado. Inicie sesión nuevamente.'
    if (estado === 403) return 'No tiene permisos para realizar esta operación.'
    if (estado === 404) return 'No se encontró el recurso solicitado.'
    if (estado === 409) return 'Ya existe una carrera con ese código.'
    if (estado >= 500) return 'Ocurrió un error interno. Inténtelo de nuevo más tarde.'

    return predeterminado
}
