# Microservicio de Historial Académico - ACA1

Microservicio encargado de consultar el historial académico de un estudiante y obtener el promedio correspondiente a cada curso matriculado.

## Historia de usuario

**ACA1** — Consulta del Historial Académico.

La información se obtiene mediante la integración con los microservicios de Expedientes, Matrículas, Notas y Cursos. No posee base de datos propia; actúa como orquestador.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de consultas en Bitácoras
- Integración HTTP con Expedientes, Matrículas, Notas y Cursos

## Endpoint base

`/historialacademico`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioHistorialAcademico_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5133`
- HTTPS: `https://localhost:7219`

## Autenticación

La operación requiere los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la consulta |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `401 Unauthorized`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| GET | `/historialacademico?tipoIdentificacion={tipo}&identificacion={id}` | Consultar historial académico de un estudiante | 200 OK |

### GET /historialacademico — Consultar historial

```http
GET /historialacademico?tipoIdentificacion=CEDULA&identificacion=123456789
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Parámetros de query:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `tipoIdentificacion` | string | Sí | Tipo de identificación del estudiante |
| `identificacion` | string | Sí | Número de identificación del estudiante |

**Respuesta exitosa (`200 OK`):**

```json
[
  {
    "codigoCurso": "CURSOTEST",
    "nombreCurso": "Curso Prueba",
    "promedio": 89.00
  }
]
```

## Formato de datos

```json
{
  "codigoCurso": "CURSOTEST",
  "nombreCurso": "Curso Prueba",
  "promedio": 89.00
}
```

## Flujo de procesamiento

1. Se valida el token mediante MicroservicioLogin.
2. Se valida la existencia del estudiante mediante MicroservicioExpedientesEstudiantes.
3. Se consultan las matrículas del estudiante mediante MicroservicioMatriculas.
4. Para cada matrícula se obtienen las notas y el desglose de rubros mediante MicroservicioNotas.
5. Se calcula el promedio ponderado de cada curso.
6. Se consulta el nombre del curso mediante MicroservicioCursos.
7. Se registra la consulta mediante MicroservicioBitacoras.
8. Se devuelve el historial académico.

## Cálculo del promedio

El promedio se calcula utilizando la nota obtenida y el porcentaje asignado a cada rubro:

\[
\text{Promedio} = \sum (\text{Nota} \times \text{Porcentaje} / 100)
\]

**Ejemplo:**
- Examen: \(85 \times 60 / 100 = 51\)
- Proyecto: \(95 \times 40 / 100 = 38\)
- **Promedio = 89**

El resultado se redondea a 2 decimales.

## Reglas de negocio / Validaciones

- `tipoIdentificacion` e `identificacion` son obligatorios.
- El estudiante debe existir en Expedientes.
- Solo se consideran las matrículas del estudiante.
- Si no hay notas para un rubro, ese rubro no aporta al promedio.
- Si no se puede obtener el nombre del curso, se usa el código del curso como fallback.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar la consulta (mejor esfuerzo) |
| Expedientes Estudiantes (MAT3) | Validar existencia del estudiante |
| Matrículas | Obtener matrículas del estudiante |
| Notas (MAT5) | Obtener notas y desglose de rubros |
| Cursos | Obtener nombre del curso |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ExpedientesUrl` → URL base de MicroservicioExpedientesEstudiantes.
- `Servicios:MatriculaUrl` → URL base de MicroservicioMatriculas.
- `Servicios:NotasUrl` → URL base de MicroservicioNotas.
- `Servicios:CursoUrl` → URL base de MicroservicioCursos.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

Este microservicio **no posee base de datos propia**. Orquesta la información desde otros servicios.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioHistorialAcademico/MicroservicioHistorialAcademico.csproj
```

**Dependencias requeridas para el flujo completo:**
- MicroservicioLogin
- MicroservicioBitacoras
- MicroservicioExpedientesEstudiantes
- MicroservicioMatriculas
- MicroservicioNotas
- MicroservicioCursos

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta realizada correctamente |
| 400 Bad Request | Parámetros requeridos ausentes o inválidos |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | Estudiante no encontrado |
| 500 Internal Server Error | Error interno durante el procesamiento |

## Diagrama de clases

![Diagrama de Clases Historial Académico](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases-HistorialAcademico.png)

---

*Documentación estandarizada del microservicio MicroservicioHistorialAcademico (ACA1).*
