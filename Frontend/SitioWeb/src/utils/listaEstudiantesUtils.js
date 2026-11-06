import bitacoraService from '../services/bitacoraService'

const TIPOS = {
    CED: 'Cedula',
    EXT: 'Extranjero',
    PAS: 'Pasaporte'
}

export const nombreTipo = codigo => TIPOS[codigo] ?? codigo

export const normalizarEstudiante = (e, indice) => ({
    id: `${e.llave ?? e.Llave ?? ''}-${indice}`,
    llave: e.llave ?? e.Llave ?? '',
    tipoIdentificacion: e.tipoIdentificacion ?? e.TipoIdentificacion ?? '',
    identificacion: e.identificacion ?? e.Identificacion ?? '',
    nombreCompleto: e.nombreCompleto ?? e.NombreCompleto ?? '',
    carrera: e.carrera ?? e.Carrera ?? '',
    curso: e.curso ?? e.Curso ?? '',
    grupo: String(e.grupo ?? e.Grupo ?? '')
})

export const formatearFecha = valor => {
    if (!valor) return ''

    const fecha = new Date(valor)

    return Number.isNaN(fecha.getTime())
        ? ''
        : fecha.toLocaleDateString('es-CR')
}

export const normalizarPeriodo = p => {
    const periodoId = String(p.periodoID ?? p.periodoId ?? p.PeriodoID ?? '')
    const anio = p.anio ?? p.Anio ?? ''
    const numeroPeriodo = p.numeroPeriodo ?? p.NumeroPeriodo ?? ''
    const fechaInicio = p.fechaInicio ?? p.FechaInicio ?? null
    const fechaFin = p.fechaFin ?? p.FechaFin ?? null

    const inicio = formatearFecha(fechaInicio)
    const fin = formatearFecha(fechaFin)

    const principal = [
        anio,
        numeroPeriodo !== '' ? `periodo ${numeroPeriodo}` : ''
    ]
        .filter(Boolean)
        .join(' ')

    const rango = inicio && fin
        ? `(${inicio} a ${fin})`
        : ''

    return {
        periodoId,
        anio,
        numeroPeriodo,
        fechaInicio,
        fechaFin,
        etiqueta: [principal, rango].filter(Boolean).join(' ') || periodoId
    }
}

export const mensajeError = (error, defecto = 'No se pudo completar la operacion') => {
    const estado = error?.response?.status
    const datos = error?.response?.data

    if (estado === 401) return 'No autorizado. Inicie sesion nuevamente'
    if (estado === 403) return 'No tiene permisos para realizar esta operacion'

    return datos?.mensaje || datos?.message || defecto
}

export const valoresUnicos = (lista, campo) =>
    [...new Set(lista.map(e => e[campo]).filter(Boolean))]
        .sort((a, b) =>
            a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })
        )

const escaparCsv = valor => {
    const texto = String(valor ?? '')
    const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto

    return `"${seguro.replace(/"/g, '""')}"`
}

export const generarCsv = (columnas, filas) => {
    const encabezado = columnas
        .map(c => escaparCsv(c.label))
        .join(';')

    const cuerpo = filas.map(fila =>
        columnas
            .map(c => escaparCsv(fila[c.key]))
            .join(';')
    )

    return '\uFEFF' + [encabezado, ...cuerpo].join('\r\n')
}

export const descargarArchivo = (contenido, nombre, tipo) => {
    const blob = new Blob([contenido], { type: tipo })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = nombre

    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)

    URL.revokeObjectURL(url)
}

const escaparHtml = valor =>
    String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

export const abrirVistaPdf = (titulo, columnas, filas) => {
    const ventana = window.open('', '_blank')

    if (!ventana) return false

    const encabezado = columnas
        .map(c => `<th>${escaparHtml(c.label)}</th>`)
        .join('')

    const cuerpo = filas
        .map(fila => {
            const celdas = columnas
                .map(c => `<td>${escaparHtml(fila[c.key])}</td>`)
                .join('')

            return `<tr>${celdas}</tr>`
        })
        .join('')

    ventana.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>${escaparHtml(titulo)}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        margin: 24px;
                    }

                    h1 {
                        font-size: 18px;
                        margin: 0 0 4px 0;
                    }

                    p {
                        margin: 0 0 14px 0;
                        color: #555;
                    }

                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }

                    th, td {
                        border: 1px solid #999;
                        padding: 4px 6px;
                        text-align: left;
                    }

                    th {
                        background: #eee;
                    }
                </style>
            </head>
            <body>
                <h1>${escaparHtml(titulo)}</h1>
                <p>${filas.length} registros</p>

                <table>
                    <thead>
                        <tr>${encabezado}</tr>
                    </thead>
                    <tbody>${cuerpo}</tbody>
                </table>
            </body>
        </html>
    `)

    ventana.document.close()
    ventana.focus()

    setTimeout(() => ventana.print(), 300)

    return true
}

export const registrarBitacora = descripcion =>
    bitacoraService
        .create({
            usuario: localStorage.getItem('usuarioId'),
            descripcion
        })
        .catch(() => null)