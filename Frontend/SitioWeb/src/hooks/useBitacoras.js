
import { useEffect, useState } from 'react'
import bitacoraService from '../services/bitacoraService'

export const normalizarTexto = texto =>
    String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const obtenerAccion = descripcion => {
    const texto = normalizarTexto(
        String(descripcion ?? '').split('{')[0]
    )

    if (/error|excepcion|fallo/.test(texto)) return 'Error'
    if (/crear|creado|registrar|registrado|alta/.test(texto)) return 'Crear'
    if (/modificar|actualizar|actualizado/.test(texto)) return 'Modificar'
    if (/eliminar|borrar|baja/.test(texto)) return 'Eliminar'
    if (/consulta|consultar|obtener|listado/.test(texto)) return 'Consultar'

    return 'Otra'
}

export default function useBitacoras({ listaCompleta = false } = {}) {
    const [bitacoras, setBitacoras] = useState([])
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState(null)
    const [errorCarga, setErrorCarga] = useState(false)

    const [pagina, setPagina] = useState(1)
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)

    useEffect(() => {
        let activo = true

        const cargarBitacoras = async () => {
            setLoading(true)
            setErrorCarga(false)

            try {
                const response = listaCompleta
                    ? await bitacoraService.getAll()
                    : await bitacoraService.getPage(pagina)

                if (!activo) return

                const respuesta = response.data

                const registros = listaCompleta
                    ? respuesta
                    : respuesta?.datos ?? respuesta?.Datos

                if (!Array.isArray(registros)) {
                    throw new Error('Respuesta de bitacoras no valida')
                }

                const normalizadas = registros.map(b => ({
                    idBitacora: b.idBitacora ?? b.IdBitacora,
                    fechaBitacora: b.fechaBitacora ?? b.FechaBitacora,
                    usuario: b.usuario ?? b.Usuario,
                    descripcion: b.descripcion ?? b.Descripcion ?? ''
                }))

                setBitacoras(normalizadas)

                if (listaCompleta) {
                    setTotalRegistros(normalizadas.length)
                    setTotalPaginas(
                        Math.max(1, Math.ceil(normalizadas.length / 15))
                    )
                } else {
                    setTotalRegistros(
                        Number(
                            respuesta?.totalRegistros ??
                            respuesta?.TotalRegistros ??
                            normalizadas.length
                        )
                    )

                    setTotalPaginas(
                        Number(
                            respuesta?.totalPaginas ??
                            respuesta?.TotalPaginas ??
                            1
                        )
                    )
                }
            } catch (error) {
                if (!activo) return

                setErrorCarga(true)
                setBitacoras([])
                setTotalRegistros(0)
                setTotalPaginas(1)

                const mensaje = error.response?.status === 401
                    ? 'No autorizado. Verifique su sesion'
                    : error.response?.data?.mensaje ||
                      'No se pudieron cargar las bitacoras'

                setNotification({
                    type: 'error',
                    message: mensaje
                })
            } finally {
                if (activo) {
                    setLoading(false)
                }
            }
        }

        cargarBitacoras()

        return () => {
            activo = false
        }
    }, [pagina, listaCompleta])

    return {
        bitacoras,
        loading,
        notification,
        setNotification,
        errorCarga,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas
    }
}
