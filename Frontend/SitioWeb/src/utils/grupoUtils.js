
export const normalizarGrupo = g => ({
    grupoCode: g.grupoCode ?? g.GrupoCode ?? '',
    numeroGrupo: g.numeroGrupo ?? g.NumeroGrupo ?? '',
    cursoCode: g.cursoCode ?? g.CursoCode ?? '',
    profesorID: g.profesorID ?? g.profesorId ?? g.ProfesorID ?? '',
    horario: g.horario ?? g.Horario ?? '',
    cupo: g.cupo ?? g.Cupo ?? '',
    periodoID: g.periodoID ?? g.periodoId ?? g.PeriodoID ?? '',
    estado: g.estado ?? g.Estado ?? true
})

export const prepararGrupoRequest = datos => ({
    grupoCode: datos.grupoCode.trim(),
    numeroGrupo: Number(datos.numeroGrupo),
    cursoCode: datos.cursoCode,
    profesorID: datos.profesorID,
    horario: datos.horario.trim(),
    cupo: Number(datos.cupo),
    periodoID: datos.periodoID
})

export const mensajeErrorGrupo = (error, defecto = 'No se pudo completar la operacion') => {
    const estado = error?.response?.status
    const datos = error?.response?.data

    if (estado === 401) return 'No autorizado. Inicie sesion nuevamente'
    if (estado === 403) return 'No tiene permisos para realizar esta operacion'
    if (estado === 404) return datos?.mensaje || 'El grupo no existe'
    if (estado === 409) return datos?.mensaje || 'Ya existe un grupo con estos datos'
    if (estado === 400) return datos?.mensaje || 'Verifique los datos ingresados'

    return datos?.mensaje || datos?.message || defecto
}

export const textoGrupo = valor =>
    String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
