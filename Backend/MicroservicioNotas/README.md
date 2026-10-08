# MAT5 - Administración de notas

Microservicio REST encargado de definir el desglose de evaluación de un grupo, asignar y modificar notas por rubro, y consultar tanto los rubros como las notas obtenidas por un estudiante. Implementa las operaciones solicitadas por la HU MAT5, valida la autenticación mediante USR5 y registra las acciones mediante GEN1.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal API
- Entity Framework Core 10
- SQL Server
- OpenAPI
- `HttpClient` para integrar Login, Bitácoras, Grupos, Expedientes y Parámetros

## Dirección local y endpoints

El perfil HTTPS incluido en el proyecto utiliza:

```text
https://localhost:7284
```

El servicio publica estas operaciones:

| Método | Endpoint | Finalidad |
|---|---|---|
| `POST` | `/cargardesglose` | Crear o reemplazar el desglose de rubros de un grupo. |
| `POST` | `/asignarnotarubro` | Asignar una nota a un estudiante. |
| `PUT` | `/asignarnotarubro` | Modificar una nota previamente asignada. |
| `GET` | `/obtenerdesglose?grupoCode={codigo}` | Consultar los rubros de un grupo. |
| `GET` | `/obtenernotas?identificacion={id}&grupoCode={codigo}` | Consultar las notas de un estudiante en un grupo. |

## Autenticación

Todas las operaciones requieren estos headers:

```http
Authorization: Bearer {token}
X-Usuario-Id: {guid}
```

Antes de ejecutar una operación, MAT5 envía el token al endpoint `POST /validate` del servicio de Login. Si falta el token, el identificador de usuario no es un GUID válido o Login rechaza el token, responde:

```text
401 Unauthorized
```

```json
{
  "mensaje": "No autorizado"
}
```

## Cargar el desglose de evaluación

```http
POST /cargardesglose
```

Body, en formato `raw` y `JSON`:

```json
{
  "grupoCode": "MATGRP1",
  "rubros": [
    {
      "nombreRubro": "Examen parcial",
      "porcentaje": 30
    },
    {
      "nombreRubro": "Proyecto",
      "porcentaje": 40
    },
    {
      "nombreRubro": "Examen final",
      "porcentaje": 30
    }
  ]
}
```

Respuesta exitosa:

```text
201 Created
```

El body devuelve los rubros creados, incluyendo el `rubroID` generado para cada uno. Se debe guardar uno de esos identificadores para probar la asignación de notas.

Reglas aplicadas:

- `grupoCode` es obligatorio y debe corresponder a un grupo existente.
- Debe enviarse al menos un rubro.
- Cada rubro requiere nombre y porcentaje mayor que cero.
- Los nombres de los rubros no pueden repetirse dentro del mismo desglose.
- La suma de los porcentajes debe coincidir con el parámetro `TOTRUBRO`, cuyo valor normal es `100`.
- Si el grupo ya tiene notas asignadas, su desglose no puede modificarse.
- Si se carga nuevamente antes de asignar notas, el desglose anterior se elimina y se reemplaza por el nuevo.

Si la suma es incorrecta, responde `400 Bad Request`:

```json
{
  "mensaje": "La sumatoria de los rubros debe sumar siempre 100."
}
```

Si ya existen notas en el grupo, responde `409 Conflict`:

```json
{
  "mensaje": "No es posible modificar los rubros: ya hay notas asignadas para este grupo."
}
```

## Asignar una nota a un rubro

```http
POST /asignarnotarubro
```

Body:

```json
{
  "rubroID": "11111111-1111-1111-1111-111111111111",
  "identificacion": "117450231",
  "nota": 85
}
```

Respuesta exitosa:

```text
201 Created
```

El `rubroID` debe copiarse de la respuesta de `/cargardesglose` o `/obtenerdesglose`. La identificación debe pertenecer a un expediente existente en MAT3.

La nota debe estar entre los parámetros `NOTAMIN` y `NOTAMAX`, normalmente `1` y `100`. Si ya existe una nota para la misma combinación de estudiante y rubro, responde `409 Conflict` y se debe utilizar el método `PUT` para modificarla.

## Modificar una nota

```http
PUT /asignarnotarubro
```

Body:

```json
{
  "rubroID": "11111111-1111-1111-1111-111111111111",
  "identificacion": "117450231",
  "nota": 92
}
```

Respuesta exitosa:

```text
200 OK
```

Debe existir previamente una nota para el estudiante y rubro indicados. En caso contrario, responde `404 Not Found`.

## Obtener el desglose de un grupo

```http
GET /obtenerdesglose?grupoCode=MATGRP1
```

No requiere body. La respuesta exitosa es `200 OK` y contiene un arreglo de rubros:

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

## Obtener las notas de un estudiante

```http
GET /obtenernotas?identificacion=117450231&grupoCode=MATGRP1
```

No requiere body. La respuesta exitosa es `200 OK` y contiene las notas asociadas al estudiante en los rubros del grupo:

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

La identificación debe corresponder a un expediente existente. El servicio consulta MAT3 para obtener internamente el `estudianteID`.

## Parámetros utilizados

MAT5 consulta el microservicio de Parámetros mediante `GET /api/parametro/{codigo}`:

| Código | Valor habitual | Uso |
|---|---:|---|
| `TOTRUBRO` | `100` | Total que deben sumar los porcentajes del desglose. |
| `NOTAMIN` | `1` | Nota mínima permitida. |
| `NOTAMAX` | `100` | Nota máxima permitida. |

MAT5 tiene esos mismos valores como respaldo cuando un parámetro no existe, está inactivo o Parámetros no está disponible. Sin embargo, para documentar que las reglas son parametrizables conviene mantener los tres registros activos en `Configuraciones_DB`.

## Integraciones y microservicios requeridos

| Servicio | URL local configurada | Operación utilizada | Finalidad |
|---|---|---|---|
| Login, HU USR5 | `https://localhost:7244` | `POST /validate` | Validar el Bearer token. |
| Bitácoras, HU GEN1 | `https://localhost:7116` | `POST /bitacora` | Registrar operaciones y errores técnicos. |
| Grupos, ACD4 | `https://localhost:7157` | `GET /grupo/{grupoCode}` | Confirmar que el grupo del desglose existe. |
| Expedientes, MAT3 | `https://localhost:7113` | `GET /expediente/{identificacion}` | Confirmar que el estudiante existe y obtener su GUID. |
| Parámetros, USR3 | `https://localhost:7051` | `GET /api/parametro/{codigo}` | Obtener `TOTRUBRO`, `NOTAMIN` y `NOTAMAX`. |

MAT5 utiliza su propia base de datos `Notas_Academicas_DB`. También deben estar disponibles las bases de datos que respaldan Login, Bitácoras, Grupos, Expedientes y Parámetros.

Orden sugerido de arranque:

1. SQL Server y las bases de datos requeridas.
2. Login.
3. Bitácoras.
4. Parámetros.
5. Grupos.
6. Expedientes MAT3.
7. Notas MAT5.

No es necesario levantar directamente Cursos, Períodos, Prematrícula o Matrícula para ejecutar las operaciones implementadas en MAT5. El grupo y el expediente utilizados en las pruebas sí deben existir previamente.

## Reglas de negocio

- El desglose requiere un grupo existente y al menos un rubro.
- Los nombres de rubros son obligatorios y no pueden repetirse.
- Cada porcentaje debe ser mayor que cero.
- La sumatoria del desglose debe coincidir con `TOTRUBRO`.
- Un desglose puede reemplazarse mientras el grupo no tenga notas asignadas.
- Una vez asignada una nota al grupo, el desglose queda bloqueado contra reemplazos.
- El rubro debe existir antes de asignar o modificar una nota.
- El estudiante debe tener un expediente existente en MAT3.
- La nota debe encontrarse entre `NOTAMIN` y `NOTAMAX`, inclusive.
- Una nota nueva se registra con `POST`; una nota existente se modifica con `PUT`.

## Bitácoras

El servicio intenta registrar:

- Carga o reemplazo de desglose: JSON de los rubros guardados.
- Asignación de nota: identificación, rubro y JSON de la nota creada.
- Modificación de nota: versión anterior y versión actual.
- Consulta de desglose: grupo consultado.
- Consulta de notas: identificación y grupo consultados.
- Error no controlado: `Error técnico: {mensaje}`.

La integración es de mejor esfuerzo: si Bitácoras falla, la operación principal continúa.

## Respuestas HTTP

| Código | Descripción |
|---:|---|
| `200 OK` | Modificación o consulta completada. |
| `201 Created` | Desglose cargado o nota asignada. |
| `400 Bad Request` | Datos inválidos, suma incorrecta, grupo/rubro/estudiante inexistente o nota fuera de rango. |
| `401 Unauthorized` | Token o identificador de usuario ausente o inválido. |
| `404 Not Found` | No existe la nota que se intenta modificar. |
| `409 Conflict` | Nota duplicada o intento de cambiar rubros después de asignar notas. |
| `500 Internal Server Error` | Error técnico no controlado. |

Los errores controlados usan este formato:

```json
{
  "mensaje": "Descripción del error"
}
```

## Persistencia

`Notas_Academicas_DB` utiliza:

- `Rubros`: desglose de evaluación por grupo.
- `NotasXEstudiante`: calificación obtenida por un estudiante en cada rubro.

Existe una restricción única para la combinación `grupoCode + nombreRubro` y otra para `rubroID + estudianteID`.

## Configuración

`appsettings.json` define:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=Notas_Academicas_DB;..."
  },
  "Servicios": {
    "LoginUrl": "https://localhost:7244",
    "BitacoraUrl": "https://localhost:7116",
    "GrupoUrl": "https://localhost:7157",
    "ExpedienteUrl": "https://localhost:7113",
    "ParametroUrl": "https://localhost:7051"
  }
}
```

Las URLs deben corresponder al ambiente de ejecución. No se deben versionar credenciales reales.

## Evidencias de pruebas técnicas solicitadas

La plantilla oficial contiene once criterios para MAT5:

1. `/cargardesglose` recibe el detalle de rubros para evaluar un curso.
2. `POST /asignarnotarubro` asigna una nota a un estudiante.
3. `PUT /asignarnotarubro` modifica una nota existente.
4. `/obtenerdesglose` obtiene los rubros de un grupo.
5. `/obtenernotas` obtiene las notas de un estudiante para un curso/grupo.
6. La sumatoria de los rubros debe ser exactamente 100, o el valor configurado en `TOTRUBRO`.
7. Volver a cargar un desglose reemplaza el anterior cuando todavía no hay notas.
8. Después de asignar notas no es posible modificar los rubros.
9. La nota solo puede estar entre 1 y 100, o los límites configurados en `NOTAMIN` y `NOTAMAX`.
10. Todas las operaciones requieren un token válido de USR5.
11. Las acciones se registran mediante GEN1.

Una secuencia práctica para obtener las capturas es:

1. Cargar un desglose válido que sume 100 y guardar un `rubroID`.
2. Consultar el desglose del grupo.
3. Volver a cargar un desglose diferente, todavía sumando 100, y demostrar que reemplazó el anterior.
4. Enviar un desglose que sume distinto de 100 y capturar el `400`.
5. Asignar una nota válida con `POST` y capturar el `201`.
6. Modificar la misma nota con `PUT` y capturar el `200`.
7. Consultar las notas del estudiante.
8. Intentar volver a cargar el desglose después de asignar la nota y capturar el `409`.
9. Intentar asignar o modificar una nota menor que 1 o mayor que 100 y capturar el `400`.
10. Ejecutar una operación sin Bearer token y capturar el `401`.
11. Consultar `/bitacora` y capturar los registros generados por MAT5.

Para demostrar explícitamente la parametrización, se pueden agregar capturas de:

```http
GET https://localhost:7051/api/parametro/TOTRUBRO
GET https://localhost:7051/api/parametro/NOTAMIN
GET https://localhost:7051/api/parametro/NOTAMAX
```

Estas capturas son complementarias: la tabla de MAT5 exige el comportamiento de suma y rango, pero no incluye una fila separada que solicite demostrar que esos valores sean parametrizables.

## Compilación

```bash
dotnet build Backend/MicroservicioNotas/MicroservicioNotas.csproj
```

## Ejecución

```bash
dotnet run --project Backend/MicroservicioNotas/MicroservicioNotas.csproj
```

Antes de probar, se deben sustituir los códigos, GUID e identificaciones de ejemplo por valores existentes en el ambiente local.
