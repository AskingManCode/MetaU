
import { useEffect, useState } from 'react'
import bitacoraService from '../services/bitacoraService'

export const normalizarTexto = texto => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const obtenerAccion = descripcion => {
    const texto = normalizarTexto(String(descripcion ?? '').split('{')[0])

    if (/error|excepcion|fallo/.test(texto)) return 'Error'
    if (/crear|creado|registrar|registrado|alta/.test(texto)) return 'Crear'
    if (/modificar|actualizar|actualizado/.test(texto)) return 'Modificar'
    if (/eliminar|borrar|baja/.test(texto)) return 'Eliminar'
    if (/consulta|consultar|obtener|listado/.test(texto)) return 'Consultar'

    return 'Otra'
}

export default function useBitacoras() {
    const [bitacoras, setBitacoras] = useState([])
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState(null)
    const [errorCarga, setErrorCarga] = useState(false)

    useEffect(() => {
        let activo = true

        bitacoraService.getAll()
            .then(({ data }) => {
                if (!activo) return
                if (!Array.isArray(data)) throw new Error('Respuesta de bitacoras no valida')

                setBitacoras(data.map(b => ({
                    idBitacora: b.idBitacora ?? b.IdBitacora,
                    fechaBitacora: b.fechaBitacora ?? b.FechaBitacora,
                    usuario: b.usuario ?? b.Usuario,
                    descripcion: b.descripcion ?? b.Descripcion ?? ''
                })))
            })
            .catch(error => {
                if (!activo) return

                setErrorCarga(true)
                const mensaje = error.response?.status === 401 ? 'No autorizado. Verifique su sesion' : error.response?.data?.mensaje || 'No se pudieron cargar las bitacoras'
                setNotification({ type: 'error', message: mensaje })
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => { activo = false }
    }, [])

    return { bitacoras, loading, notification, setNotification, errorCarga }
}
