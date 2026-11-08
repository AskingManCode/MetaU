# Microservicio de Lista de Estudiantes - ACA2

Genera el listado de estudiantes matriculados en un período, combinando información de otros microservicios mediante llamadas HTTP. No tiene base de datos propia; actúa como orquestador.

## Historia de usuario

**ACA2** — Listado de estudiantes matriculados en un período.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de consultas en Bitácoras
- Integración HTTP con Grupos, Matrículas, Cursos y Carreras

## Endpoint base

`/listadoestudiantes`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioListaEstudiantes_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5162`
- HTTPS: `https://localhost:7173`

## Autenticación

La operación requiere los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la consulta |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido → `400 Bad Request`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| GET | `/listadoestudiantes?periodo={guid}` | Obtener el listado de estudiantes matriculados en el período | 200 OK |

### GET /listadoestudiantes — Consultar listado

```http
GET /listadoestudiantes?periodo=11111111-1111-1111-1111-111111111111
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

El parámetro `periodo` es obligatorio y debe ser un GUID válido correspondiente a un `PeriodoID` existente.

**Respuesta exitosa (`200 OK`):**

```json
[
  {
    "llave": "118760234",
    "tipoIdentificacion": "CED",
    "identificacion": "118760234",
    "nombreCompleto": "Maria Fernanda Rojas",
    "carrera": "Ingenieria en Sistemas",
    "curso": "Programacion V",
    "grupo": "1"
  }
]
```

Si el período existe pero no tiene grupos o matrículas asociadas, responde con un arreglo vacío.

## Formato de datos

```json
{
  "llave": "118760234",
  "tipoIdentificacion": "CED",
  "identificacion": "118760234",
  "nombreCompleto": "Maria Fernanda Rojas",
  "carrera": "Ingenieria en Sistemas",
  "curso": "Programacion V",
  "grupo": "1"
}
```

`llave` usa la identificación del estudiante cuando no existe otro identificador de fila. Las respuestas se serializan en camelCase.

## Flujo de procesamiento

1. Se valida el token mediante MicroservicioLogin y el header `X-Usuario-Id`.
2. Se consultan todos los grupos (MicroservicioGrupos) y se filtran los que pertenecen al período solicitado.
3. Para cada grupo, se consultan los estudiantes matriculados en ese curso y grupo (MicroservicioMatriculas).
4. Para cada grupo, se consulta el curso (MicroservicioCursos) y, con el código de carrera, se consulta la carrera (MicroservicioCarreras).
5. Se combina la información y se registra la consulta en MicroservicioBitacoras.
6. Se devuelve el listado.

## Reglas de negocio / Validaciones

- El parámetro `periodo` es obligatorio y debe ser un GUID válido.
- Si no hay grupos o matrículas para el período, se devuelve un arreglo vacío (no error).
- La información se obtiene en tiempo real de los servicios dependientes.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar la consulta (mejor esfuerzo) |
| Grupos (ACD4) | Obtener grupos del período |
| Matrículas | Obtener estudiantes matriculados por curso y grupo |
| Cursos | Obtener nombre del curso y código de carrera |
| Carreras | Obtener nombre de la carrera |
| Períodos | (referencia para el `periodo`) |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:GrupoUrl` → URL base de MicroservicioGrupos.
- `Servicios:MatriculaUrl` → URL base de MicroservicioMatriculas.
- `Servicios:CursoUrl` → URL base de MicroservicioCursos.
- `Servicios:CarreraUrl` → URL base de MicroservicioCarreras.
- `Servicios:PeriodoUrl` → URL base de MicroservicioPeriodos.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

Este microservicio **no posee base de datos propia**. Orquesta la información desde otros servicios.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioListaEstudiantes/MicroservicioListaEstudiantes.csproj
```

**Dependencias requeridas para el flujo completo:**
- MicroservicioLogin
- MicroservicioBitacoras
- MicroservicioGrupos
- MicroservicioMatriculas
- MicroservicioCursos
- MicroservicioCarreras

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta completada (con o sin resultados) |
| 400 Bad Request | Parámetro `periodo` ausente, no es GUID válido o `X-Usuario-Id` inválido |
| 401 Unauthorized | Token ausente o inválido |
| 500 Internal Server Error | Error técnico o falla al consultar microservicios dependientes |

## Diagrama de clases

![Diagrama de Clases Lista de Estudiantes](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_ListadoEstudiantes.png)

---

*Documentación estandarizada del microservicio MicroservicioListaEstudiantes (ACA2).*
