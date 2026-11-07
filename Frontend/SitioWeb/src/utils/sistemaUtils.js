export const normalizarRol = r => ({
    idRol: r.idRol ?? r.IdRol ?? '',
    nombre: r.nombre ?? r.Nombre ?? ''
})

export const normalizarModulo = m => ({
    idModulo: m.idModulo ?? m.IdModulo ?? '',
    nombre: m.nombre ?? m.Nombre ?? '',
    estado: m.estado ?? m.Estado ?? true,
    orden: m.orden ?? m.Orden ?? 0
})

export const mensajeError = (error, defecto = 'No se pudo completar la operacion') => {
    const estado = error?.response?.status
    const datos = error?.response?.data

    if (estado === 401) return 'No autorizado. Inicie sesion nuevamente'
    if (estado === 403) return 'No tiene permisos para realizar esta operacion'

    return datos?.message || datos?.mensaje || defecto
}

export const textoBusqueda = valor =>
    String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()