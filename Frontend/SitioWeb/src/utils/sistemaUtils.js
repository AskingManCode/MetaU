export const normalizarRol = r => ({
    idRol: r.idRol ?? r.IdRol ?? '',
    nombre: r.nombre ?? r.Nombre ?? ''
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