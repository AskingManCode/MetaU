# MicroservicioNotificaciones

Envía notificaciones por correo electrónico usando SMTP y registra cada intento en `Notificaciones_DB`.

**URL base local:** pendiente de definir para cada ambiente; en ejecución local, `http://localhost:PORT`

**Prefijo de rutas:** `/api/notificar`

**Diagrama de clases:**  

![Diagrama de clases de Gestión de Notificaciones](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_GestionNotificaciones.png)

## Antes de consumir la API

La operación requiere estos headers:

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Bearer <token>` | Token emitido por MicroservicioLogin. |
| `UsuarioGUID` | `<UUID>` | GUID del usuario que solicita el envío; se guarda en la notificación y se usa en la bitácora. |
| `Content-Type` | `application/json` | Tipo de contenido del cuerpo. |

El servicio valida el token mediante MicroservicioLogin. Si falta el token, no usa el esquema `Bearer` o el token es inválido, responde `401 Unauthorized`. Si `UsuarioGUID` falta o no contiene un GUID válido, responde `400 Bad Request`.

El correo debe tener entre 7 y 150 caracteres y un formato válido, sin espacios ni puntos consecutivos. El asunto es obligatorio y admite hasta 200 caracteres. El cuerpo es obligatorio y se envía como HTML.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/api/notificar/` | Registrar y enviar un correo de notificación. |

No hay endpoints para consultar, modificar ni eliminar notificaciones.

### Enviar una notificación

```http
POST /api/notificar/
Authorization: Bearer <token>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Content-Type: application/json
Accept: application/json

{
  "email": "destinatario@example.com",
  "asunto": "Aviso de MetaU",
  "cuerpo": "<p>Su solicitud fue procesada.</p>"
}
```

Si el correo se envía, responde `200 OK`. Primero se guarda la notificación con estado `PENDIENTE`; después, si el envío SMTP termina correctamente, se actualiza a `ENVIADO`. Si el envío falla, se intenta guardar el estado `ERROR` y el detalle técnico en la base de datos; la API responde `500 Internal Server Error` con un mensaje genérico.

## Formato de datos

La respuesta exitosa tiene esta forma:

```json
{
  "email": "destinatario@example.com",
  "asunto": "Aviso de MetaU",
  "cuerpo": "<p>Su solicitud fue procesada.</p>",
  "estado": "ENVIADO",
  "mensaje": "Correo enviado correctamente",
  "fechaEnvio": "2026-10-08T06:04:00Z"
}
```

`fechaEnvio` corresponde a la fecha UTC del envío. El servicio serializa los nombres JSON en camelCase. En solicitudes inválidas, el cuerpo de respuesta contiene `errores`, un arreglo de objetos con `campo` y `mensaje`. Un error de validación lanzado durante el procesamiento responde `{ "mensaje": "..." }`.

## Respuestas y errores comunes

| Estado | Cuándo ocurre |
| --- | --- |
| `200 OK` | Correo enviado y estado actualizado a `ENVIADO`. |
| `400 Bad Request` | `UsuarioGUID` inválido, correo/asunto/cuerpo que no cumplen las validaciones o error de argumentos al procesar. |
| `401 Unauthorized` | Falta el token Bearer, tiene formato incorrecto o MicroservicioLogin lo rechaza. |
| `500 Internal Server Error` | Falla técnica al validar una dependencia, persistir la notificación o enviarla por SMTP. |

El servicio registra las operaciones en MicroservicioBitacoras. Si falla el registro de bitácora, el resultado principal del envío no cambia.

## Ejecutar y configurar

Requisitos: .NET 10, SQL Server y acceso a un servidor SMTP. Crea la base de datos y sus tablas ejecutando [`01. Notificaciones_DB.sql`](../../Scripts%20SQL/Notificaciones_DB/01.%20Notificaciones_DB.sql); luego carga los estados y la plantilla `CUSTOM` con [`02. DatosIniciales.sql`](../../Scripts%20SQL/Notificaciones_DB/02.%20DatosIniciales.sql). El segundo script es necesario porque cada notificación requiere un estado y una plantilla activos.

Desde la raíz del repositorio:

```powershell
dotnet run --project .\Backend\MicroservicioNotificaciones\MicroservicioNotificaciones.csproj
```

Configura estos valores en el entorno de ejecución. No guardes credenciales reales de SQL Server ni SMTP en el repositorio:

| Clave | Uso |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Cadena de conexión a SQL Server y a `Notificaciones_DB`. |
| `MicroservicioLogin:BaseUrl` | URL base de MicroservicioLogin, con `/` al final; el servicio invoca `validate`. |
| `MicroservicioBitacoras:BaseUrl` | URL base de MicroservicioBitacoras, con `/` al final; el servicio invoca `bitacora`. |
| `Smtp:Host` | Host del servidor SMTP. |
| `Smtp:Port` | Puerto SMTP. |
| `Smtp:User` | Usuario de autenticación SMTP. |
| `Smtp:Password` | Contraseña SMTP. |
| `Smtp:From` | Dirección remitente. |
| `Smtp:FromName` | Nombre visible del remitente. |
| `Smtp:EnableSsl` | Usa STARTTLS cuando es `true`; sin cifrado SMTP cuando es `false`. |

En variables de entorno .NET, reemplaza `:` por `__`; por ejemplo, `Smtp:Password` se configura como `Smtp__Password`. Swagger y OpenAPI interactivo se habilitan únicamente en el ambiente `Development`.

## Persistencia y componentes

Las notificaciones se guardan en `Notificaciones_DB.dbo.Notificaciones`. El endpoint crea la fila usando `dbo.usp_Notificaciones_Crear` con la plantilla `CUSTOM`, estado inicial `PENDIENTE` y un JSON de parámetros que contiene el asunto y el cuerpo. Tras intentar el envío, `dbo.usp_Notificaciones_ActualizarEstado` registra `ENVIADO` o `ERROR`, actualiza la fecha de envío si corresponde e incrementa el contador de intentos.

Flujo principal: endpoint HTTP -> validación de token, usuario y cuerpo -> `NotificacionesService` -> SMTP y `NotificacionesRepository` -> SQL Server. La autenticación y la auditoría se integran respectivamente con MicroservicioLogin y MicroservicioBitacoras.
