# ACD5 - Administracion de Periodos

Microservicio encargado de la administracion de periodos academicos.

Permite crear, modificar, eliminar y consultar periodos, validando la autenticacion del usuario e integrando el registro de acciones mediante el microservicio de bitacoras.

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
/periodo
```

## Autenticacion

Todas las operaciones requieren un token valido.

Headers requeridos:

```text
Authorization: Bearer {token}
X-Usuario-Id: {guid}
```

El token es validado mediante el MicroservicioLogin antes de ejecutar cada operacion.

## Crear periodo

```http
POST /periodo
```

Request:

```json
{
  "anio": 2028,
  "numeroPeriodo": 1,
  "fechaInicio": "2028-01-10",
  "fechaFin": "2028-04-30"
}
```

Respuesta exitosa:

```text
201 Created
```

Si ya existe un periodo con la misma combinacion de anio y numero de periodo:

```text
409 Conflict
```

```json
{
  "mensaje": "Ya existe un periodo con el mismo anio y numero de periodo"
}
```

## Modificar periodo

```http
PUT /periodo/{periodoID}
```

Request:

```json
{
  "anio": 2028,
  "numeroPeriodo": 1,
  "fechaInicio": "2028-01-15",
  "fechaFin": "2028-05-01"
}
```

Respuesta exitosa:

```text
200 OK
```

Si el periodo no existe:

```text
404 Not Found
```

Si la modificacion genera un periodo duplicado:

```text
409 Conflict
```

## Eliminar periodo

```http
DELETE /periodo/{periodoID}
```

Respuesta exitosa:

```text
200 OK
```

Si el periodo no existe:

```text
404 Not Found
```

## Obtener todos los periodos

```http
GET /periodo
```

Respuesta exitosa:

```text
200 OK
```

## Obtener periodo por ID

```http
GET /periodo/{periodoID}
```

El identificador del periodo debe ser un GUID valido.

Ejemplo:

```text
GET /periodo/7285dd45-94bf-f111-a104-f44ee3f03ff7
```

Respuesta exitosa:

```text
200 OK
```

Si el periodo no existe:

```text
404 Not Found
```

## Datos del periodo

Cada periodo contiene:

- PeriodoID
- Anio
- NumeroPeriodo
- FechaInicio
- FechaFin
- Estado

## Validaciones

El microservicio valida:

- Anio requerido.
- Numero de periodo requerido.
- Fecha de inicio requerida.
- Fecha de fin requerida.
- Reglas definidas para las fechas del periodo.
- Existencia del periodo antes de modificar o eliminar.
- Que no exista otro periodo con la misma combinacion de anio y numero de periodo.
- Token de autenticacion valido.
- Identificador de usuario valido.

## Bitacora

Las operaciones realizadas sobre periodos generan registros mediante GEN1.

Se registran acciones como:

- Crear periodo.
- Modificar periodo.
- Eliminar periodo.
- Consultar periodos.
- Consultar periodo por ID.
- Errores tecnicos.

## Configuracion

El archivo `appsettings.json` contiene las configuraciones requeridas para la conexion a base de datos y comunicacion con los servicios externos.

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

## Procedimientos almacenados

El microservicio utiliza los siguientes procedimientos:

```text
dbo.usp_Periodo_Crear
dbo.usp_Periodo_Modificar
dbo.usp_Periodo_Eliminar
dbo.usp_Periodo_ObtenerTodos
dbo.usp_Periodo_ObtenerPorId
```

## Codigos HTTP

| Codigo | Descripcion |
|---|---|
| 200 | Operacion realizada correctamente |
| 201 | Periodo creado correctamente |
| 400 | Datos invalidos o usuario requerido |
| 401 | Token inexistente o invalido |
| 404 | Periodo no encontrado |
| 409 | Periodo duplicado |
| 500 | Error interno del servidor |

## Compilacion

```bash
dotnet build Backend/MicroservicioPeriodos/MicroservicioPeriodos.csproj
```

## Ejecucion

```bash
dotnet run --project Backend/MicroservicioPeriodos/MicroservicioPeriodos.csproj
```