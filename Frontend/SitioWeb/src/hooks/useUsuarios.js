import { useEffect, useState } from 'react'
import usuarioService from '../services/usuarioService'
import { mensajeError } from '../utils/sistemaUtils'
import { normalizarUsuario } from '../utils/usuarioUtils'

// filtros: { identificacion, nombre, tipo, dominio, rol }
// orden:   { key, direction }
export default function useUsuarios({ filtros, orden }) {
    const [registros, setRegistros] = useState([])
    const [pagina, setPagina] = useState(1)
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [loading, setLoading] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)
    const [actualizacion, setActualizacion] = useState(0)

    const claveFiltros = JSON.stringify(filtros)
    const claveOrden = JSON.stringify(orden)

    useEffect(() => {
        let activo = true
        const filtrosActuales = JSON.parse(claveFiltros)
        const ordenActual = JSON.parse(claveOrden)

        // El servicio trata un texto vacio como un valor, por eso solo se envian los que tienen contenido
        const params = { pagina }

        Object.entries(filtrosActuales).forEach(([campo, valor]) => {
            if (String(valor ?? '').trim()) params[campo] = String(valor).trim()
        })

        if (ordenActual.key) {
            params.ordenarPor = ordenActual.key
            params.direccion = ordenActual.direction
        }

        setLoading(true)
        setErrorCarga(null)

        usuarioService.getAll(params)
            .then(({ data }) => {
                if (!activo) return

                if (!Array.isArray(data?.datos)) {
                    throw new Error('Respuesta no valida del servicio de usuarios')
                }

                const paginas = Math.max(1, Number(data.totalPaginas) || 1)

                setRegistros(data.datos.map(normalizarUsuario))
                setTotalRegistros(Number(data.totalRegistros) || 0)
                setTotalPaginas(paginas)

                if (pagina > paginas) setPagina(paginas)
            })
            .catch(error => {
                if (!activo) return

                setRegistros([])
                setTotalRegistros(0)
                setTotalPaginas(1)
                setErrorCarga(mensajeError(error, 'No se pudieron cargar los usuarios'))
            })
            .finally(() => {
                if (activo) setLoading(false)
            })

        return () => {
            activo = false
        }
    }, [claveFiltros, claveOrden, pagina, actualizacion])

    const eliminar = async email => {
        await usuarioService.delete(email)
        setActualizacion(actual => actual + 1)
    }

    return {
        registros,
        pagina,
        setPagina,
        totalRegistros,
        totalPaginas,
        loading,
        errorCarga,
        eliminar
    }
}