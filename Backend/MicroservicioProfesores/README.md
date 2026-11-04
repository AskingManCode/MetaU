# Microservicio de Profesores

Microservicio encargado de la administración de los profesores de MetaU.

## Historia de usuario

Administración de profesores.

Permite crear, modificar, eliminar y consultar profesores, validando la autenticación e integrando la consulta de parámetros y el registro de acciones mediante bitácoras.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- SQL Server (`Microsoft.Data.SqlClient`)
- Autenticación mediante JWT (MicroservicioLogin)
- Registro de acciones en Bitácoras
- Consulta de parámetros para dominio de correo y paginación

## Endpoint base

`/profesor`

**URL base en producción:**  
Pendiente de confirmar.

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5062`
- HTTPS: `https://localhost:7133`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer token-de-ejemplo` | Token emitido por MicroservicioLogin |
| `X-Usuario-Id` | `<GUID>` | Identificador del usuario que realiza la operación |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `X-Usuario-Id` o no es un GUID válido distinto de vacío → `400 Bad Request`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/profesor` | Crear un profesor | 201 Created |
| PUT | `/profesor/{profesorID}` | Modificar un profesor | 200 OK |
| DELETE | `/profesor/{profesorID}` | Eliminar un profesor | 200 OK |
| GET | `/profesor` | Obtener todos los profesores | 200 OK |
| GET | `/profesor?pagina={n}` | Obtener profesores paginados | 200 OK |
| GET | `/profesor/{profesorID}` | Obtener un profesor por ID | 200 OK |

`profesorID` debe ser un GUID válido. La ruta solo acepta GUID; un identificador con otro formato no coincide con la ruta y responde `404 Not Found`.

### POST /profesor — Crear

```http
POST /profesor
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "usuarioID": "00000000-0000-0000-0000-000000000001",
  "tipoIdentificacionCode": "CED",
  "identificacion": "123456789",
  "email": "profesor.prueba@cuc.ac.cr",
  "nombreCompleto": "Profesor Prueba",
  "fechaNacimiento": "1990-05-15",
  "telefonos": ["88888888"]
}
```

**Respuesta exitosa (`201 Created`):** el objeto profesor creado (con `profesorID` y `estado: true`); incluye un header `Location` con la ruta del recurso creado.

### PUT /profesor/{profesorID} — Modificar

El `profesorID` de la ruta identifica el registro. El `usuarioID` asociado y el estado actual se conservan; los teléfonos enviados reemplazan los existentes.

```http
PUT /profesor/00000000-0000-0000-0000-000000000002
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "tipoIdentificacionCode": "CED",
  "identificacion": "123456789",
  "email": "profesor.modificado@cuc.ac.cr",
  "nombreCompleto": "Profesor Prueba Modificado",
  "fechaNacimiento": "1990-05-15",
  "telefonos": ["88888888", "87777777"]
}
```

**Respuesta:** `200 OK` con el objeto actualizado o `404 Not Found` si no existe.

### DELETE /profesor/{profesorID} — Eliminar

La eliminación es física: se elimina el profesor y sus teléfonos asociados de la base de datos.

```http
DELETE /profesor/00000000-0000-0000-0000-000000000002
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta:** `200 OK` con los datos del profesor eliminado o `404 Not Found` si no existe.

### GET /profesor y GET /profesor/{profesorID}

```http
GET /profesor
GET /profesor/00000000-0000-0000-0000-000000000002
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

La consulta de la colección devuelve todos los profesores, incluidos los inactivos. La consulta individual responde `200 OK` o `404 Not Found`.

### Paginación

Agregar `?pagina=1` (valor ≥ 1). El tamaño de página se obtiene del parámetro `PAGSIZE` (por defecto **15**, nunca superior a 15). Si el parámetro no devuelve un entero positivo o la solicitud al servicio de parámetros falla con un error HTTP, se utiliza el valor por defecto. Los resultados se ordenan por nombre completo y, en caso de empate, por `profesorID`.

```http
GET /profesor?pagina=1
Authorization: Bearer token-de-ejemplo
X-Usuario-Id: 00000000-0000-0000-0000-000000000001
```

**Respuesta paginada:**

```json
{
  "pagina": 1,
  "tamanoPagina": 15,
  "totalRegistros": 1,
  "totalPaginas": 1,
  "datos": [
    {
      "profesorID": "00000000-0000-0000-0000-000000000002",
      "usuarioID": "00000000-0000-0000-0000-000000000001",
      "tipoIdentificacionCode": "CED",
      "identificacion": "123456789",
      "email": "profesor.prueba@cuc.ac.cr",
      "nombreCompleto": "Profesor Prueba",
      "fechaNacimiento": "1990-05-15T00:00:00",
      "estado": true,
      "telefonos": ["88888888"]
    }
  ]
}
```

## Formato de datos

```json
{
  "profesorID": "00000000-0000-0000-0000-000000000002",
  "usuarioID": "00000000-0000-0000-0000-000000000001",
  "tipoIdentificacionCode": "CED",
  "identificacion": "123456789",
  "email": "profesor.prueba@cuc.ac.cr",
  "nombreCompleto": "Profesor Prueba",
  "fechaNacimiento": "1990-05-15T00:00:00",
  "estado": true,
  "telefonos": ["88888888"]
}
```

## Reglas de negocio / Validaciones

- `usuarioID`, `tipoIdentificacionCode`, `identificacion`, `email`, `nombreCompleto`, `fechaNacimiento` y al menos un teléfono son obligatorios.
- `usuarioID` debe ser un GUID distinto de vacío.
- El nombre completo debe contener solo letras y espacios; la base de datos limita el campo a 175 caracteres y rechaza espacios al inicio/final o secuencias de espacios repetidos.
- El profesor debe tener al menos 18 años.
- El correo debe pertenecer al dominio configurado en el parámetro `DOMPROF`.
- La identificación debe contener entre 9 y 30 caracteres alfanuméricos, sin espacios, y ser única.
- El correo debe tener formato válido, no superar los 150 caracteres y ser único en la base de datos.
- Cada teléfono debe tener entre 8 y 25 dígitos y ser único para el profesor. Al modificar se reemplaza la lista completa.
- Al modificar, `usuarioID` y `estado` conservan sus valores actuales.
- La eliminación es física.
- Para paginar, `pagina` debe ser mayor o igual a 1.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones y errores técnicos |
| Parámetros | Obtener `DOMPROF` para validar el dominio de correo y `PAGSIZE` para paginación |

El dominio del correo se consulta mediante el identificador `DOMPROF`; su valor inicial en la parametrización es `cuc.ac.cr`. Las llamadas de registro a Bitácoras forman parte del procesamiento de las operaciones; si Bitácoras falla, la solicitud puede responder `500 Internal Server Error`, incluso si la operación principal ya se ejecutó.

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:OfertaAcademica` → Cadena de conexión a `tiusr20pl_Oferta_Academica_DB` en producción.
- `Servicios:LoginUrl` → URL base de MicroservicioLogin.
- `Servicios:BitacoraUrl` → URL base de MicroservicioBitacoras.
- `Servicios:ParametroUrl` → URL base de MicroservicioParametros.
- `Parametros:IdentificadorDominioProfesor` → Identificador del parámetro que contiene el dominio de correo permitido (por defecto `DOMPROF`).
- `Cors:AllowedOrigins` → Orígenes permitidos para CORS.

> **Nota de seguridad:** No versionar contraseñas ni credenciales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `tiusr20pl_Oferta_Academica_DB` (compartida con Instituciones, Carreras y Cursos).  
Tablas utilizadas, dentro del esquema `MetaU_DB_User`: `Profesores` y `TelefonosXProfesores`.  
Usa los procedimientos almacenados `MetaU_DB_User.usp_Profesor_Crear`, `MetaU_DB_User.usp_Profesor_Modificar`, `MetaU_DB_User.usp_Profesor_Eliminar`, `MetaU_DB_User.usp_Profesor_ObtenerTodos` y `MetaU_DB_User.usp_Profesor_ObtenerPorId`.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioProfesores/MicroservicioProfesores.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Consulta, modificación o eliminación exitosa |
| 201 Created | Profesor creado |
| 400 Bad Request | Datos inválidos, nombre con caracteres no permitidos, menor de edad, correo inválido o dominio incorrecto, o `X-Usuario-Id` ausente/no válido |
| 401 Unauthorized | Token ausente o inválido |
| 404 Not Found | Profesor no encontrado |
| 500 Internal Server Error | Error técnico no controlado o restricción de base de datos incumplida |

## Diagrama de clases

![Diagrama de Clases Profesores](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_AdministracionProfesores.png)

---

*Documentación estandarizada del microservicio MicroservicioProfesores.*
