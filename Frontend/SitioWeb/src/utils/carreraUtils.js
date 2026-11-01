export const normalizarTextoCarrera = valor =>
    String(valor ?? '').trim().replace(/ +/g, ' ')

export const textoBusquedaCarrera = valor =>
    String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const mensajeErrorCarrera = (
    error,
    predeterminado = 'No se pudo completar la operación.'
) => {
    const estado = error?.response?.status
    const datos = error?.response?.data

    if (estado === 500) {
        return 'Ocurrió un error interno. Inténtelo de nuevo más tarde.'
    }

    if ([400, 404, 409].includes(estado)) {
        return datos?.mensaje || datos?.message || predeterminado
    }

    return datos?.mensaje || datos?.message || predeterminado
}

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

export const normalizarCarrera = carrera => ({
    carreraCode:
        carrera?.carreraCode ??
        carrera?.CarreraCode ??
        '',
    institucionCode:
        carrera?.institucionCode ??
        carrera?.InstitucionCode ??
        '',
    directorID:
        carrera?.directorID ??
        carrera?.directorId ??
        carrera?.DirectorID ??
        '',
    nombre: carrera?.nombre ?? carrera?.Nombre ?? '',
    estado: carrera?.estado ?? carrera?.Estado
})
