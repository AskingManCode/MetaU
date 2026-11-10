export const TIPOS_IDENTIFICACION = [
    { codigo: 'CED', nombre: 'Cedula' },
    { codigo: 'EXT', nombre: 'Extranjero' },
    { codigo: 'PAS', nombre: 'Pasaporte' }
]

export const DOMINIOS = ['cuc.cr', 'cuc.ac.cr']

export const normalizarUsuario = u => ({
    email: u.email ?? u.Email ?? '',
    tipoIdentificacion: u.tipoIdentificacionCode ?? u.TipoIdentificacionCode ?? '',
    identificacion: u.identificacion ?? u.Identificacion ?? '',
    nombre: u.nombreCompleto ?? u.NombreCompleto ?? '',
    idRol: u.rolCode ?? u.RolCode ?? '',
    estado: u.estado ?? u.Estado ?? true,
    fechaModificacion: u.fechaModificacion ?? u.FechaModificacion ?? null
})

export const formatearFecha = valor => {
    if (!valor) return 'No disponible'

    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime())
        ? 'No disponible'
        : fecha.toLocaleString('es-CR')
}

export const nombreTipo = codigo =>
    TIPOS_IDENTIFICACION.find(t => t.codigo === codigo)?.nombre ?? codigo