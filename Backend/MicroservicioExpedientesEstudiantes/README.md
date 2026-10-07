# MAT3 - Administración de expedientes de estudiantes

Microservicio REST encargado de crear, modificar, eliminar y consultar los expedientes de estudiantes. Implementa las cinco operaciones solicitadas por la HU MAT3, valida el dominio institucional mediante parametrización, verifica la autenticación mediante USR5 y registra las acciones mediante GEN1.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal API
- Entity Framework Core 10
- SQL Server
- OpenAPI
- `HttpClient` para integrar Login, Bitácoras y Parámetros

## Dirección local y endpoint base

El perfil HTTPS incluido en el proyecto utiliza:

```text
https://localhost:7113
```

Todas las operaciones se publican bajo:

```text
/expediente
```

## Autenticación

Todas las operaciones requieren estos headers:

```http
Authorization: Bearer {token}
X-Usuario-Id: {guid}
```

Antes de ejecutar una operación, el microservicio envía el token al endpoint `POST /validate` del servicio de Login. Si falta el token, `X-Usuario-Id` no contiene un GUID válido o Login rechaza el token, responde:

```text
401 Unauthorized
```

```json
{
  "mensaje": "No autorizado"
}
```

El usuario y la contraseña solamente se envían al servicio de Login para obtener el token; no se incluyen en los cuerpos de MAT3.

## Contrato del expediente

### Request

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `identificacion` | `string` | Sí | Número de identificación único del estudiante. |
| `tipoIdentificacion` | `string` | Sí | Código del tipo de identificación. |
| `email` | `string` | Sí | Correo con formato válido y dominio institucional parametrizado. |
| `nombreCompleto` | `string` | Sí | Nombre compuesto únicamente por letras y espacios. |
| `fechaNacimiento` | `date` | Sí | Fecha de nacimiento en formato `YYYY-MM-DD`. |
| `provinciaID` | `Guid` | Sí | Identificador de la provincia. |
| `cantonID` | `Guid` | Sí | Identificador del cantón. |
| `distritoID` | `Guid` | Sí | Identificador del distrito. |
| `otrasSenas` | `string` | Sí | Detalle adicional de la dirección. |
| `telefonos` | `string[]` | Sí | Lista con al menos un teléfono no vacío. |

```json
{
  "identificacion": "402230980",
  "tipoIdentificacion": "NACIONAL",
  "email": "kev.hernandez@cuc.cr",
  "nombreCompleto": "Kev Josue Hernandez Ulate",
  "fechaNacimiento": "2002-05-15",
  "provinciaID": "11111111-1111-1111-1111-111111111111",
  "cantonID": "22222222-2222-2222-2222-222222222222",
  "distritoID": "33333333-3333-3333-3333-333333333333",
  "otrasSenas": "De la iglesia doscientos metros al norte",
  "telefonos": [
    "88887777",
    "22223333"
  ]
}
```

### Response

La respuesta agrega datos internos como `estudianteID`, `usuarioID`, `estado`, la dirección agrupada y los registros de teléfonos:

```json
{
  "estudianteID": "11111111-1111-1111-1111-111111111111",
  "usuarioID": null,
  "identificacion": "402230980",
  "tipoIdentificacion": "NACIONAL",
  "email": "kev.hernandez@cuc.cr",
  "nombreCompleto": "Kev Josue Hernandez Ulate",
  "fechaNacimiento": "2002-05-15",
  "direccion": {
    "provinciaID": "11111111-1111-1111-1111-111111111111",
    "cantonID": "22222222-2222-2222-2222-222222222222",
    "distritoID": "33333333-3333-3333-3333-333333333333",
    "otrasSenas": "De la iglesia doscientos metros al norte"
  },
  "estado": true,
  "telefonos": [
    {
      "telefonoXEstudiante": 1,
      "estudianteID": "11111111-1111-1111-1111-111111111111",
      "numero": "88887777"
    }
  ]
}
```

Los GUID y datos del ejemplo son ilustrativos y deben sustituirse por valores apropiados para el ambiente de ejecución.

## Crear un expediente

```http
POST /expediente
```

Se envía el contrato completo como JSON. La respuesta exitosa es:

```text
201 Created
Location: /expediente/{identificacion}
```

La identificación y el email deben ser únicos. Si ya existe un expediente activo con la misma identificación, responde:

```text
409 Conflict
```

```json
{
  "mensaje": "Ya existe un expediente con esa identificación."
}
```

Si la identificación corresponde a un expediente eliminado lógicamente, el servicio lo reactiva y actualiza sus datos.

## Modificar un expediente

```http
PUT /expediente/{identificacion}
```

Ejemplo:

```http
PUT /expediente/402230980
```

Se envía el contrato completo como JSON. La identificación de la ruta determina el expediente que se actualiza. La respuesta exitosa es `200 OK` con el expediente actualizado.

Si no existe un expediente activo con esa identificación, responde `404 Not Found`.

## Eliminar un expediente

```http
DELETE /expediente/{identificacion}
```

Ejemplo:

```http
DELETE /expediente/402230980
```

No requiere body. La respuesta exitosa es:

```text
204 No Content
```

La eliminación es lógica: el registro permanece almacenado con `estado = false`. Esto evita romper las relaciones desde Prematrículas y Matrículas. Los endpoints de consulta solo devuelven expedientes activos.

## Obtener todos los expedientes

```http
GET /expediente
```

No requiere body. Responde `200 OK` con un arreglo de expedientes activos y sus teléfonos.

## Obtener un expediente por identificación

```http
GET /expediente/{identificacion}
```

Ejemplo:

```http
GET /expediente/402230980
```

No requiere body. Responde `200 OK` cuando el expediente está activo. Si no existe o fue eliminado lógicamente, responde:

```text
404 Not Found
```

```json
{
  "mensaje": "No existe un expediente con esa identificación."
}
```

## Reglas de negocio

- Todos los campos del request son obligatorios.
- Los textos requeridos no pueden estar vacíos ni contener únicamente espacios.
- `provinciaID`, `cantonID` y `distritoID` deben ser GUID distintos de cero.
- Debe proporcionarse al menos un teléfono y ninguno puede estar vacío.
- Los teléfonos repetidos dentro del request se eliminan durante la normalización.
- El nombre completo solo admite letras Unicode y espacios.
- Los espacios repetidos del nombre y las otras señas se normalizan.
- El email debe tener un formato válido.
- El email debe terminar en el dominio definido por el parámetro `DOMEST`.
- La identificación debe ser única entre los expedientes activos.
- El email es único incluso frente a expedientes eliminados lógicamente.
- Al modificar un expediente, la lista anterior de teléfonos se reemplaza por la nueva.
- La eliminación es lógica y un POST posterior puede reactivar el expediente.

## Dominio institucional parametrizable

MAT3 consulta este parámetro:

```http
GET https://localhost:7051/api/parametro/DOMEST
```

Respuesta esperada:

```json
{
  "parametroCode": "DOMEST",
  "valor": "cuc.cr",
  "estado": true
}
```

MAT3 propaga al servicio de Parámetros:

```http
Authorization: Bearer {token}
UsuarioGUID: {guid}
```

Si `DOMEST` no existe, está inactivo, no contiene un valor o Parámetros no está disponible, el cliente utiliza `cuc.cr` como valor predeterminado.

## Integraciones y microservicios requeridos

| Servicio | URL local configurada | Operación utilizada | Finalidad |
|---|---|---|---|
| Login, HU USR5 | `https://localhost:7244` | `POST /validate` | Validar el Bearer token. |
| Bitácoras, HU GEN1 | `https://localhost:7116` | `POST /bitacora` | Registrar operaciones y errores técnicos. |
| Parámetros, HU USR3 | `https://localhost:7051` | `GET /api/parametro/DOMEST` | Obtener el dominio institucional permitido. |

MAT3 utiliza `Matriculas_DB` para almacenar `Estudiantes` y `TelefonosXEstudiantes`.

Orden sugerido de arranque:

1. SQL Server y las bases de datos requeridas.
2. Login.
3. Bitácoras.
4. Parámetros.
5. Expedientes MAT3.

El código actual no consulta directamente Cursos, Grupos, Períodos, Prematrículas, Matrículas ni el microservicio de Ubicaciones. Los identificadores de provincia, cantón y distrito se almacenan y se valida que no sean GUID vacíos, pero MAT3 no comprueba mediante otro servicio su existencia o relación jerárquica.

## Bitácoras

El servicio intenta registrar:

- Creación: JSON completo del expediente creado.
- Modificación: JSON del expediente anterior y del actualizado.
- Eliminación: JSON completo del expediente eliminado lógicamente.
- Consulta general: `El usuario consulta expedientes de estudiantes`.
- Consulta individual: identificación consultada.
- Error no controlado: `Error técnico: {mensaje}`.

La integración es de mejor esfuerzo: si Bitácoras falla, la operación principal continúa.

## Respuestas HTTP

| Código | Descripción |
|---:|---|
| `200 OK` | Modificación o consulta completada. |
| `201 Created` | Expediente creado o reactivado. |
| `204 No Content` | Expediente eliminado lógicamente. |
| `400 Bad Request` | Datos requeridos ausentes, nombre inválido, email inválido o dominio incorrecto. |
| `401 Unauthorized` | Token o identificador de usuario ausente o inválido. |
| `404 Not Found` | Expediente inexistente o inactivo. |
| `409 Conflict` | Identificación o email duplicado. |
| `500 Internal Server Error` | Error técnico no controlado. |

Los errores controlados usan este formato:

```json
{
  "mensaje": "Descripción del error"
}
```

## Persistencia

El servicio utiliza las tablas:

- `Estudiantes`: datos generales, dirección, estado y vínculo opcional con un usuario.
- `TelefonosXEstudiantes`: uno o varios teléfonos asociados al estudiante.

La identificación y el email tienen índices únicos. La dirección se modela como parte del estudiante, mientras que los teléfonos se almacenan en una tabla relacionada.

## Configuración

`appsettings.json` debe definir:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=Matriculas_DB;..."
  },
  "Servicios": {
    "LoginUrl": "https://localhost:7244",
    "BitacoraUrl": "https://localhost:7116",
    "ParametroUrl": "https://localhost:7051"
  }
}
```

Las URLs deben corresponder al ambiente de ejecución. Las credenciales de SQL Server deben administrarse mediante configuración local segura o variables de entorno y no deben versionarse en el repositorio.

## Evidencias de pruebas técnicas solicitadas

La plantilla oficial contiene doce criterios para MAT3:

1. Crear un expediente.
2. Modificar un expediente.
3. Eliminar un expediente.
4. Obtener todos los expedientes.
5. Obtener un expediente por su llave primaria.
6. Mostrar número y tipo de identificación, email, nombre completo, fecha de nacimiento, dirección y teléfonos.
7. Comprobar que todos los datos son obligatorios y no aceptan vacíos o espacios en blanco.
8. Comprobar que el nombre solo permite letras y espacios.
9. Comprobar el formato del email y el dominio `cuc.cr`.
10. Demostrar que el dominio institucional es parametrizable mediante `DOMEST`.
11. Demostrar que las operaciones requieren un token válido de USR5.
12. Mostrar las acciones registradas mediante GEN1.

Una secuencia práctica para obtener las capturas es:

1. Crear un expediente válido y capturar el `201`.
2. Consultarlo por identificación y capturar todos sus campos.
3. Consultar todos los expedientes.
4. Modificar el expediente y capturar el `200`.
5. Enviar un dato requerido vacío y capturar el `400`.
6. Enviar números en el nombre y capturar el `400`.
7. Enviar un email con formato o dominio incorrecto y capturar el `400`.
8. Consultar `GET /api/parametro/DOMEST` y capturar su valor activo.
9. Ejecutar una operación sin Bearer token y capturar el `401`.
10. Eliminar el expediente y capturar el `204`.
11. Consultar Bitácora y capturar los registros generados por MAT3.

El `409 Conflict` por identificación duplicada y el `404 Not Found` posterior a una eliminación son pruebas adicionales útiles, aunque no aparecen como filas independientes en la tabla oficial de MAT3.

## Compilación

```bash
dotnet build Backend/MicroservicioExpedientesEstudiantes/MicroservicioExpedientesEstudiantes.csproj
```

## Ejecución

```bash
dotnet run --project Backend/MicroservicioExpedientesEstudiantes/MicroservicioExpedientesEstudiantes.csproj
```

Antes de ejecutar las solicitudes, se deben sustituir los GUID, identificaciones y teléfonos de ejemplo por datos apropiados para el ambiente local.
