# MicroservicioListaEstudiantes

Genera el listado de estudiantes matriculados en un periodo (ACA2), combinando información real de otros microservicios mediante llamadas HTTP: no tiene base de datos propia, solo orquesta.

**URL base del servicio:** pendiente de definir para cada ambiente; en ejecución local, `https://localhost:PORT`.

**Prefijo de rutas:** `/listadoestudiantes`

**Diagrama de clases:**

![Diagrama de Clases](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_ListadoEstudiantes.png)

## Antes de consumir la API

Todas las operaciones requieren estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin. |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación; se usa también para la bitácora. |

El servicio valida el token consultando MicroservicioLogin (`POST /validate`). Sin token o con token inválido responde `401 Unauthorized`. Si falta `X-Usuario-Id` o no es un GUID válido responde `400 Bad Request`.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/listadoestudiantes?periodo={guid}` | Obtener el listado de estudiantes matriculados en el periodo indicado. |

El parámetro `periodo` es obligatorio y se envía como query string, no en el cuerpo. Debe ser un GUID válido correspondiente a un `PeriodoID` existente.

### Consultar

```http
GET /listadoestudiantes?periodo=11111111-1111-1111-1111-111111111111
Authorization: Bearer <JWT>
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

Responde `400 Bad Request` si `periodo` falta o no tiene formato de GUID válido. Si el periodo existe pero no tiene grupos o matrículas asociadas, responde `200 OK` con un arreglo vacío.

## Formato de datos

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

`llave` usa la identificación del estudiante cuando no existe otro identificador de fila. ASP.NET Core serializa los nombres JSON en camelCase por defecto.

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Consulta completada (con o sin resultados). |
| `400 Bad Request` | El parámetro `periodo` falta o no es un GUID válido, o `X-Usuario-Id` ausente/no válido. |
| `401 Unauthorized` | Falta el header Bearer o el token no es válido. |
| `500 Internal Server Error` | Error técnico no recuperable, incluye fallas al consultar cualquiera de los microservicios dependientes (Grupos, Matrículas, Cursos o Carreras). |

La operación registra una acción en MicroservicioBitacoras. Si la bitácora no está disponible, la operación principal continúa.

## Ejecutar y configurar

Requisitos: .NET 10. Este microservicio no tiene base de datos propia; depende de que los siguientes microservicios estén disponibles al momento de la consulta: MicroservicioLogin, MicroservicioBitacoras, MicroservicioGrupos, MicroservicioMatriculas, MicroservicioCursos y MicroservicioCarreras.

Desde la raíz del repositorio:

```powershell
dotnet run --project .\Backend\MicroservicioListaEstudiantes\MicroservicioListaEstudiantes.csproj
```

La aplicación requiere estos valores de configuración. En despliegues se pueden definir mediante variables de entorno .NET (separador `__`); no se deben guardar credenciales reales en el repositorio:

| Clave | Ejemplo/uso |
| --- | --- |
| `Servicios:LoginUrl` | URL base de MicroservicioLogin, con `/` al final; se invoca `validate`. |
| `Servicios:BitacoraUrl` | URL base de MicroservicioBitacoras, con `/` al final; se invoca `bitacora`. |
| `Servicios:GrupoUrl` | URL base de MicroservicioGrupos, con `/` al final; se invoca `grupo` para obtener los grupos y filtrarlos por periodo. |
| `Servicios:MatriculaUrl` | URL base de MicroservicioMatriculas, con `/` al final; se invoca `matricula` filtrando por curso y grupo. |
| `Servicios:CursoUrl` | URL base de MicroservicioCursos, con `/` al final; se invoca `curso/{id}` para el nombre del curso y su carrera asociada. |
| `Servicios:CarreraUrl` | URL base de MicroservicioCarreras, con `/` al final; se invoca `carrera/{id}` para el nombre de la carrera. |

Equivalentes como variables de entorno: `Servicios__LoginUrl`, `Servicios__BitacoraUrl`, `Servicios__GrupoUrl`, `Servicios__MatriculaUrl`, `Servicios__CursoUrl` y `Servicios__CarreraUrl`. Swagger y OpenAPI interactivo se habilitan solo cuando el ambiente es `Development`.

## Componentes y flujo

No persiste datos propios: no usa base de datos ni procedimientos almacenados. El flujo de una consulta es:

1. Valida el token (MicroservicioLogin) y el header `X-Usuario-Id`.
2. Consulta todos los grupos (MicroservicioGrupos) y filtra los que pertenecen al periodo solicitado.
3. Para cada grupo, consulta los estudiantes matriculados en ese curso y grupo (MicroservicioMatriculas); esa respuesta ya trae tipo de identificación, identificación y nombre completo.
4. Para cada grupo, consulta el curso (MicroservicioCursos) y, con el código de carrera que éste devuelve, consulta la carrera (MicroservicioCarreras).
5. Combina todo en la respuesta y registra la consulta en MicroservicioBitacoras.