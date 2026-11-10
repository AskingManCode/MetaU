# Microservicio de Notas - MAT5

Microservicio REST encargado de definir el desglose de evaluación de un grupo, asignar y modificar notas por rubro, y consultar tanto los rubros como las notas obtenidas por un estudiante.

## Historia de usuario

**MAT5** — Administración de notas.

Implementa las operaciones de cargar desglose, asignar/modificar notas y consultar. Valida la autenticación mediante USR5 y registra las acciones mediante GEN1.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Entity Framework Core 10
- SQL Server
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Integración con Grupos, Expedientes y Parámetros

## Endpoint base

Los endpoints se publican en la raíz (sin prefijo común).

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioNotas_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5192`
- HTTPS: `https://localhost:7284`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `401 Unauthorized`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/cargardesglose` | Crear o reemplazar el desglose de rubros de un grupo | 201 Created |
| POST | `/asignarnotarubro` | Asignar una nota a un estudiante en un rubro | 201 Created |
| PUT | `/asignarnotarubro` | Modificar una nota previamente asignada | 200 OK |
| GET | `/obtenerdesglose?grupoCode={codigo}` | Consultar los rubros de un grupo | 200 OK |
| GET | `/obtenernotas?identificacion={id}&grupoCode={codigo}` | Consultar las notas de un estudiante en un grupo | 200 OK |

### POST /cargardesglose — Cargar desglose

```http
POST /cargardesglose
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "grupoCode": "MATGRP1",
  "rubros": [
    { "nombreRubro": "Examen parcial", "porcentaje": 30 },
    { "nombreRubro": "Proyecto", "porcentaje": 40 },
    { "nombreRubro": "Examen final", "porcentaje": 30 }
  ]
}
```

**Respuesta exitosa (`201 Created`):** los rubros creados (con `rubroID`).  
Si el grupo ya tiene desglose y no tiene notas, se reemplaza.

### POST /asignarnotarubro — Asignar nota

```http
POST /asignarnotarubro
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "rubroID": "11111111-1111-1111-1111-111111111111",
  "identificacion": "117450231",
  "nota": 85
}
```

### PUT /asignarnotarubro — Modificar nota

```http
PUT /asignarnotarubro
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "rubroID": "11111111-1111-1111-1111-111111111111",
  "identificacion": "117450231",
  "nota": 92
}
```

### Consultas

```http
GET /obtenerdesglose?grupoCode=MATGRP1
GET /obtenernotas?identificacion=117450231&grupoCode=MATGRP1
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

## Formato de respuesta (desglose)

```json
[
  {
    "rubroID": "11111111-1111-1111-1111-111111111111",
    "grupoCode": "MATGRP1",
    "nombreRubro": "Examen parcial",
    "porcentaje": 30,
    "bloqueado": true,
    "estado": true
  }
]
```

## Formato de respuesta (notas)

```json
[
  {
    "notaXEstudianteID": 1,
    "rubroID": "11111111-1111-1111-1111-111111111111",
    "estudianteID": "22222222-2222-2222-2222-222222222222",
    "nota": 92,
    "fechaRegistro": "2026-10-06"
  }
]
```

## Reglas de negocio / Validaciones

- El desglose requiere un `grupoCode` existente y al menos un rubro.
- Los nombres de rubros son obligatorios, no pueden repetirse y el porcentaje debe ser > 0.
- La suma de los porcentajes debe coincidir con el parámetro `TOTRUBRO` (normalmente 100).
- Si el grupo ya tiene notas asignadas, el desglose no puede modificarse.
- Si se carga nuevamente antes de asignar notas, el desglose anterior se reemplaza.
- El estudiante debe tener un expediente existente (MAT3).
- La nota debe estar entre `NOTAMIN` y `NOTAMAX` (normalmente 1 y 100).
- Una nota nueva se registra con `POST`; una existente se modifica con `PUT`.
- No se puede asignar dos veces la misma nota (estudiante + rubro).

## Parámetros utilizados

| Código | Valor habitual | Uso |
|--------|----------------|-----|
| `TOTRUBRO` | 100 | Total que deben sumar los porcentajes |
| `NOTAMIN` | 1 | Nota mínima permitida |
| `NOTAMAX` | 100 | Nota máxima permitida |

Si el parámetro no está disponible, se usan los valores por defecto.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| Grupos (ACD4) | Confirmar que el grupo existe |
| Expedientes Estudiantes (MAT3) | Confirmar que el estudiante existe y obtener su GUID |
| Parámetros | Obtener `TOTRUBRO`, `NOTAMIN` y `NOTAMAX` |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:NotasAcademicas` → Cadena de conexión a `Notas_Academicas_DB`.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:GrupoUrl` → URL base de MicroservicioGrupos.
- `Servicios:ExpedienteUrl` → URL base de MicroservicioExpedientesEstudiantes.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Notas_Academicas_DB`  
Tablas principales: `Rubros`, `NotasXEstudiante`.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioNotas/MicroservicioNotas.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Modificación o consulta exitosa |
| 201 Created | Desglose cargado o nota asignada |
| 400 Bad Request | Datos inválidos, suma incorrecta, grupo/rubro/estudiante inexistente o nota fuera de rango |
| 401 Unauthorized | Token o `X-Usuario-Id` ausente/inválido |
| 404 Not Found | No existe la nota que se intenta modificar |
| 409 Conflict | Nota duplicada o intento de cambiar rubros después de asignar notas |
| 500 Internal Server Error | Error técnico no controlado |

## Diagrama de clases

![Diagrama de Clases Notas](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionNotas.png)

---

*Documentación estandarizada del microservicio MicroservicioNotas (MAT5).*
