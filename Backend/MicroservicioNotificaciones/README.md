# Microservicio de Notificaciones - MAT4 / ADM22

Envía notificaciones por correo electrónico usando SMTP, consulta el historial de envíos y registra cada intento en `Notificaciones_DB`.

## Historia de usuario

- **MAT4** — Servicio para Notificaciones.
- **ADM22** — Envío de Notificaciones por Correo e Historial de Envíos.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- Dapper sobre SQL Server
- MailKit / MimeKit (SMTP para envío de correos)
- Autenticación mediante Bearer Token (MicroservicioLogin)
- Configuración dinámica de servidor/cuenta SMTP (MicroservicioParametros)
- Registro de acciones en Bitácoras (MicroservicioBitacoras)

## Endpoint base

`/api/notificar`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioNotificaciones_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5186`
- HTTPS: `https://localhost:7234`

## Autenticación

Todas las operaciones requieren los siguientes headers:

| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT>` | Token emitido por MicroservicioLogin |
| `UsuarioGUID` | `<GUID>` | Identificador del usuario que solicita la operación (se guarda en la notificación y se usa en bitácora) |

El token se valida contra `POST /validate` de Login.  
Sin token o token inválido → `401 Unauthorized`.  
Si falta `UsuarioGUID` o no es un GUID válido → `400 Bad Request`.

> **Nota:** Este microservicio usa el header `UsuarioGUID` (en lugar de `X-Usuario-Id`).

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/api/notificar/` | Registrar y enviar un correo de notificación individual | 200 OK |
| POST | `/api/notificar/multiple` | Registrar y enviar notificaciones a múltiples destinatarios | 200 OK |
| GET | `/api/notificar/` | Consultar historial completo de notificaciones enviadas | 200 OK |

---

### POST /api/notificar/ — Enviar notificación individual

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

---

### POST /api/notificar/multiple — Enviar a múltiples destinatarios

```http
POST /api/notificar/multiple
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
Content-Type: application/json

{
  "emails": [
    "estudiante1@cuc.cr",
    "estudiante2@cuc.cr"
  ],
  "asunto": "Aviso de Matrícula",
  "cuerpo": "<p>El periodo de matrícula está abierto.</p>"
}
```

**Respuesta exitosa (`200 OK`):**

```json
{
  "totalEnviados": 2,
  "totalFallidos": 0,
  "resultados": [
    {
      "email": "estudiante1@cuc.cr",
      "asunto": "Aviso de Matrícula",
      "cuerpo": "<p>El periodo de matrícula está abierto.</p>",
      "estado": "ENVIADO",
      "mensaje": "Correo enviado correctamente",
      "fechaEnvio": "2026-11-11T19:30:00Z"
    },
    {
      "email": "estudiante2@cuc.cr",
      "asunto": "Aviso de Matrícula",
      "cuerpo": "<p>El periodo de matrícula está abierto.</p>",
      "estado": "ENVIADO",
      "mensaje": "Correo enviado correctamente",
      "fechaEnvio": "2026-11-11T19:30:00Z"
    }
  ]
}
```

---

### GET /api/notificar/ — Consultar historial de notificaciones

```http
GET /api/notificar/
Authorization: Bearer <JWT>
UsuarioGUID: 00000000-0000-0000-0000-000000000001
```

**Respuesta exitosa (`200 OK`):**

```json
[
  {
    "notificacionID": 105,
    "usuarioID": "00000000-0000-0000-0000-000000000001",
    "emailDestino": "estudiante1@cuc.cr",
    "plantillaNotificacionCode": "CUSTOM",
    "parametrosJson": "{\"Asunto\":\"Aviso\",\"Cuerpo\":\"<p>Prueba</p>\"}",
    "asunto": "Aviso",
    "cuerpo": "<p>Prueba</p>",
    "fechaCreacion": "2026-11-11T19:25:00Z",
    "fechaEnvio": "2026-11-11T19:25:01Z",
    "estadoNotificacion": "ENVIADO",
    "estadoNombre": "Enviado correctamente",
    "mensajeError": null,
    "numeroIntentos": 1,
    "fechaUltimoIntento": "2026-11-11T19:25:01Z"
  }
]
```

## Reglas de negocio / Validaciones

- El correo debe tener entre 7 y 150 caracteres y formato válido (sin espacios ni puntos consecutivos).
- El asunto es obligatorio y admite hasta 200 caracteres.
- El cuerpo es obligatorio y se envía como HTML.
- Se usa la plantilla `CUSTOM` y estados `PENDIENTE` / `ENVIADO` / `ERROR`.
- Los parámetros del servidor y cuenta SMTP se resuelven exclusivamente mediante `MicroservicioParametros` (claves: `SMTPHOST`, `SMTPPORT`, `SMTPUSER`, `SMTPPASS`, `SMTPFROM`, `SMTPNAME`, `SMTPSSL`), las cuales se configuran por referencia en `ParametrosSmtp`. No se almacenan credenciales ni datos de correo en `appsettings.json`.

## Integraciones

| Servicio | Uso |
|----------|-----|
| Login (USR5) | Validar token JWT |
| Bitácoras (GEN1) | Registrar operaciones (envío individual, múltiple y consulta de historial) |
| Parámetros (CFG1) | Obtener configuración de cuenta y servidor SMTP |
| SMTP | Envío del correo |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:DefaultConnection` → Cadena de conexión a `Notificaciones_DB`.
- `MicroservicioLogin:BaseUrl` → URL base de MicroservicioLogin.
- `MicroservicioBitacoras:BaseUrl` → URL base de MicroservicioBitacoras.
- `MicroservicioParametros:BaseUrl` → URL base de MicroservicioParametros.
- `ParametrosSmtp:HostCode` → Código del parámetro para el host SMTP (`SMTPHOST`).
- `ParametrosSmtp:PortCode` → Código del parámetro para el puerto SMTP (`SMTPPORT`).
- `ParametrosSmtp:UserCode` → Código del parámetro para el usuario SMTP (`SMTPUSER`).
- `ParametrosSmtp:PasswordCode` → Código del parámetro para la contraseña SMTP (`SMTPPASS`).
- `ParametrosSmtp:FromCode` → Código del parámetro para el remitente SMTP (`SMTPFROM`).
- `ParametrosSmtp:FromNameCode` → Código del parámetro para el nombre del remitente (`SMTPNAME`).
- `ParametrosSmtp:EnableSslCode` → Código del parámetro para SSL/TLS (`SMTPSSL`).

> **Nota de seguridad:** No versionar contraseñas SMTP, credenciales de base de datos ni datos reales. Las credenciales de correo se gestionan íntegramente en la base de datos de configuraciones / MicroservicioParametros.

## Base de datos

**Base de datos:** `Notificaciones_DB`  
Tabla principal: `Notificaciones`.  
Usa procedimientos almacenados:
- `usp_Notificaciones_Crear`
- `usp_Notificaciones_ActualizarEstado`
- `usp_Notificaciones_ObtenerTodos`

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioNotificaciones/MicroservicioNotificaciones.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Operación exitosa (envío o consulta de historial) |
| 400 Bad Request | `UsuarioGUID` inválido o validaciones de email/asunto/cuerpo fallidas |
| 401 Unauthorized | Token ausente, formato incorrecto o rechazado por Login |
| 500 Internal Server Error | Falla técnica al persistir o enviar por SMTP |

## Diagrama de clases

![Diagrama de Clases Notificaciones](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_GestionNotificaciones.png)

---

*Documentación estandarizada del microservicio MicroservicioNotificaciones (MAT4 / ADM22).*
