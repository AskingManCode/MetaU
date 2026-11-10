
export const normalizarProfesor = p => ({
    profesorID: p.profesorID ?? p.profesorId ?? p.ProfesorID ?? '',
    usuarioID: p.usuarioID ?? p.usuarioId ?? p.UsuarioID ?? '',
    tipoIdentificacionCode: p.tipoIdentificacionCode ?? p.TipoIdentificacionCode ?? '',
    identificacion: p.identificacion ?? p.Identificacion ?? '',
    email: p.email ?? p.Email ?? '',
    nombreCompleto: p.nombreCompleto ?? p.NombreCompleto ?? '',
    fechaNacimiento: String(p.fechaNacimiento ?? p.FechaNacimiento ?? '').slice(0, 10),
    estado: p.estado ?? p.Estado ?? true,
    telefonos: Array.isArray(p.telefonos ?? p.Telefonos) ? p.telefonos ?? p.Telefonos : []
})

export const mensajeError = (error, defecto = 'No se pudo completar la operacion') => {
    const estado = error?.response?.status
    const datos = error?.response?.data

    if (estado === 401) return 'No autorizado. Inicie sesion nuevamente'
    if (estado === 403) return 'No tiene permisos para realizar esta operacion'
    if (estado === 409) return datos?.mensaje || 'El registro tiene un conflicto con otros datos'

    return datos?.mensaje || datos?.message || defecto
}

export const prepararProfesorRequest = datos => ({
    usuarioID: datos.usuarioID.trim(),
    tipoIdentificacionCode: datos.tipoIdentificacionCode.trim(),
    identificacion: datos.identificacion.trim(),
    email: datos.email.trim(),
    nombreCompleto: datos.nombreCompleto.trim(),
    fechaNacimiento: `${datos.fechaNacimiento}T00:00:00`,
    telefonos: datos.telefonos.map(t => t.trim())
})

export const textoBusqueda = valor =>
    String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
