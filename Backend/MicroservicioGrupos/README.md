# ACD4 - Administracion de Grupos

Microservicio encargado de la administracion de grupos academicos

Permite crear, modificar, eliminar y consultar grupos, validando autenticacion e integrando el registro de acciones mediante bitacoras.

## Tecnologias

- .NET 10
- Minimal API
- SQL Server
- Microsoft.Data.SqlClient
- Bearer Token
- Integracion con MicroservicioLogin
- Integracion con MicroservicioBitacoras

## Endpoint base

```text
/grupo
```

## Autenticacion

Todas las operaciones requieren un token valido.

Headers requeridos:

```text
Authorization: Bearer {token}
X-Usuario-Id: {guid}
```

El token se valida mediante el MicroservicioLogin antes de ejecutar cada operacion.

## Crear grupo

```http
POST /grupo
```

Request:

```json
{
  "grupoCode": "GRP001",
  "numeroGrupo": 1,
  "cursoCode": "CURSOTEST",
  "profesorID": "6D76980F-15C0-F111-A105-F44EE3F03FF7",
  "horario": "Lunes 18:00-21:00",
  "cupo": 30,
  "periodoID": "D3282E06-49BD-F111-A101-F44EE3F03FF7"
}
```

Respuesta exitosa:

```text
201 Created
```

Si el identificador del grupo ya existe:

```text
409 Conflict
```

Si ya existe un grupo con la misma combinacion de curso, periodo y numero de grupo:

```text
409 Conflict
```

```json
{
  "mensaje": "Ya existe un grupo con el mismo curso, periodo y numero de grupo"
}
```

## Modificar grupo

```http
PUT /grupo/{grupoCode}
```

El identificador enviado en la ruta debe coincidir con el identificador enviado en el body.

Respuesta exitosa:

```text
200 OK
```

Si el grupo no existe:

```text
404 Not Found
```

## Eliminar grupo

```http
DELETE /grupo/{grupoCode}
```

Respuesta exitosa:

```text
200 OK
```

Si el grupo no existe:

```text
404 Not Found
```

## Obtener todos los grupos

```http
GET /grupo
```

Respuesta exitosa:

```text
200 OK
```

## Obtener grupo por identificador

```http
GET /grupo/{grupoCode}
```

Respuesta exitosa:

```text
200 OK
```

Si el grupo no existe:

```text
404 Not Found
```

## Datos del grupo

Cada grupo contiene:

- GrupoCode
- NumeroGrupo
- CursoCode
- ProfesorID
- Horario
- Cupo
- PeriodoID
- Estado

## Validaciones

El microservicio valida:

- Identificador del grupo requerido.
- Numero de grupo requerido.
- Curso requerido.
- Profesor requerido.
- Horario requerido.
- Cupo requerido.
- Periodo requerido.
- Token de autenticacion valido.
- Identificador de usuario valido.
- Existencia del grupo antes de modificar o eliminar.
- No duplicar la combinacion de curso, periodo y numero de grupo.

Las relaciones con curso, profesor y periodo son protegidas mediante las relaciones definidas en la base de datos.

## Bitacora

Las operaciones realizadas sobre grupos generan registros mediante GEN1.

Se registran acciones como:

- Crear grupo.
- Modificar grupo.
- Eliminar grupo.
- Consultar grupos.
- Consultar grupo por identificador.
- Errores tecnicos.

## Configuracion

El archivo `appsettings.json` contiene las configuraciones requeridas para la conexion a base de datos y comunicacion con servicios externos.

```json
{
  "ConnectionStrings": {
    "OfertaAcademica": ""
  },
  "Servicios": {
    "LoginUrl": "",
    "BitacoraUrl": ""
  }
}
```

Los valores deben configurarse segun el ambiente correspondiente.

No se deben versionar credenciales, servidores ni URLs locales.

## Codigos HTTP

| Codigo | Descripcion |
|---|---|
| 200 | Operacion realizada correctamente |
| 201 | Grupo creado correctamente |
| 400 | Datos invalidos |
| 401 | Token inexistente o invalido |
| 404 | Grupo no encontrado |
| 409 | Conflicto por grupo duplicado |
| 500 | Error interno del servidor |

## Compilacion

```bash
dotnet build Backend/MicroservicioGrupos/MicroservicioGrupos.csproj
```

## Ejecucion

```bash
dotnet run --project Backend/MicroservicioGrupos/MicroservicioGrupos.csproj
```