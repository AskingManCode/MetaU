export const normalizarTextoCurso = valor =>
    String(valor ?? '').trim().replace(/ +/g, ' ')

export const normalizarCurso = curso => ({
    cursoCode: curso?.cursoCode ?? curso?.CursoCode ?? '',
    carreraCode: curso?.carreraCode ?? curso?.CarreraCode ?? '',
    nombre: curso?.nombre ?? curso?.Nombre ?? '',
    nivel: curso?.nivel ?? curso?.Nivel ?? '',
    estado: curso?.estado ?? curso?.Estado
})

export const normalizarCarreraCurso = carrera => ({
    carreraCode: carrera?.carreraCode ?? carrera?.CarreraCode ?? '',
    nombre: carrera?.nombre ?? carrera?.Nombre ?? ''
})

export const mensajeErrorCurso = (
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

export const mensajeErrorGuardarCurso = error => {
    if (error?.response?.status === 500) {
        return 'No se pudo guardar: verifique que el código y el nombre no estén repetidos en la carrera.'
    }

    return mensajeErrorCurso(error, 'No se pudo guardar el curso.')
}
