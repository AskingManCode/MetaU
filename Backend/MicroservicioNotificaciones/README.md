# Microservicio de Notificaciones - MAT4

Envía notificaciones por correo electrónico usando SMTP y registra cada intento en `Notificaciones_DB`.

## Historia de usuario

**MAT4** — Servicio para Notificaciones.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- SMTP para envío de correos
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Registro de acciones en Bitácoras

## Endpoint base

`/api/notificar`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioNotificaciones_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5186`
- HTTPS: `https://localhost:7234`

## Autenticación

La operación requiere los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `UsuarioGUID` | `<GUID>` | Identificador del usuario que solicita el envío (se guarda en la notificación y se usa en bitácora) |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `UsuarioGUID` o no es un GUID válido → `400 Bad Request`.

> **Nota:** Este microservicio usa el header `UsuarioGUID` (en lugar de `X-Usuario-Id`).

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/api/notificar/` | Registrar y enviar un correo de notificación | 200 OK |

No hay endpoints para consultar, modificar ni eliminar notificaciones.

### POST /api/notificar/ — Enviar notificación

```http
POST /api/notificar/
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "email": "destinatario@example.com",
  "asunto": "Aviso de MetaU",
  "cuerpo": "<p>Su solicitud fue procesada.</p>"
}
```

**Respuesta exitosa (`200 OK`):**

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

Flujo: se guarda la notificación con estado `PENDIENTE`; si el envío SMTP es exitoso se actualiza a `ENVIADO`. Si falla el envío, se intenta guardar `ERROR` y se responde `500`.

## Reglas de negocio / Validaciones

- El correo debe tener entre 7 y 150 caracteres y formato válido (sin espacios ni puntos consecutivos).
- El asunto es obligatorio y admite hasta 200 caracteres.
- El cuerpo es obligatorio y se envía como HTML.
- Se usa la plantilla `CUSTOM` y estados `PENDIENTE` / `ENVIADO` / `ERROR`.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (mejor esfuerzo) |
| SMTP | Envío del correo |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:DefaultConnection` → Cadena de conexión a `Notificaciones_DB`.
- `MicroservicioLogin:BaseUrl` → URL base de MicroservicioLogin.
- `MicroservicioBitacoras:BaseUrl` → URL base de MicroservicioBitacoras.
- `Smtp:Host` → Host del servidor SMTP.
- `Smtp:Port` → Puerto SMTP.
- `Smtp:User` → Usuario SMTP.
- `Smtp:Password` → Contraseña SMTP.
- `Smtp:From` → Dirección remitente.
- `Smtp:FromName` → Nombre visible del remitente.
- `Smtp:EnableSsl` → Usar STARTTLS.

> **Nota de seguridad:** No versionar contraseñas SMTP, credenciales de base de datos ni datos reales. Usar variables de entorno o secretos de Plesk en producción.

## Base de datos

**Base de datos:** `Notificaciones_DB`  
Tabla principal: `Notificaciones`.  
Usa procedimientos almacenados (`usp_Notificaciones_Crear`, `usp_Notificaciones_ActualizarEstado`).

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioNotificaciones/MicroservicioNotificaciones.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Correo enviado y estado actualizado a `ENVIADO` |
| 400 Bad Request | `UsuarioGUID` inválido o validaciones de email/asunto/cuerpo fallidas |
| 401 Unauthorized | Token ausente, formato incorrecto o rechazado por Login |
| 500 Internal Server Error | Falla técnica al persistir o enviar por SMTP |

## Diagrama de clases

![Diagrama de Clases Notificaciones](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_GestionNotificaciones.png)

---

*Documentación estandarizada del microservicio MicroservicioNotificaciones (MAT4).*
