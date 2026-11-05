# Microservicio de Login - USR5

Microservicio encargado de la autenticación de usuarios y la gestión de tokens de acceso y renovación del sistema MetaU.

## Historia de usuario

**USR5** — Login.

El servicio permite autenticar usuarios mediante su nombre de usuario (email) y contraseña, generar tokens JWT y refresh tokens, renovar sesiones y validar tokens de acceso.

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- SQL Server (`Microsoft.Data.SqlClient`)
- JWT Bearer Token + Refresh Tokens
- BCrypt para hash de contraseñas
- SHA256 para hash de refresh tokens
- Integración con Bitácoras y Parámetros (según configuración)

## Endpoint base

`/login`, `/refresh`, `/validate`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/MicroservicioLogin_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:57075`
- HTTPS: `https://localhost:57074`

## Autenticación

Este microservicio es el emisor de tokens. Los demás servicios validan contra él.

- `/login` no requiere token previo (usa headers de credenciales).
- `/refresh` recibe el refresh token en el body.
- `/validate` recibe el `Authorization: Bearer <token>`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| POST | `/login` | Autenticar usuario | 201 Created |
| POST | `/refresh` | Renovar tokens | 201 Created |
| POST | `/validate` | Validar un JWT | 200 OK |

### POST /login — Autenticar

Las credenciales se envían en **headers** (no en el body).

```http
POST /login
usuario: usuario@cuc.cr
contrasena: MiClaveSegura
```

**Respuesta exitosa (`201 Created`):**

```json
{
  "expires_in": "2026-11-04T19:35:00",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6...",
  "usuarioID": "00000000-0000-0000-0000-000000000001"
}
```

Credenciales incorrectas o usuario inactivo → `401 Unauthorized`.

### POST /refresh — Renovar sesión

```http
POST /refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Respuesta exitosa (`201 Created`):**

```json
{
  "expires_in": "2026-11-04T19:40:00",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "nuevoRefreshToken..."
}
```

El refresh token anterior se revoca (rotación). Token inválido, expirado o revocado → `401 Unauthorized`.

### POST /validate — Validar token

```http
POST /validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (`200 OK`):** `true`  
Token inválido o ausente → `401 Unauthorized`.

## Reglas de negocio / Validaciones

- El usuario debe existir, estar activo (`Estado = true`) y la contraseña debe coincidir (BCrypt).
- El lookup se hace por email (`usuario` header).
- Los refresh tokens se almacenan hasheados (SHA256) y se rotan en cada renovación.
- Access token expira según configuración (`MinutosExpiracionAccessToken`, por defecto 5 minutos).
- Refresh token expira según configuración (`MinutosExpiracionRefreshToken`, por defecto 60 minutos).

## Integraciones

| Servicio | Uso |
|----------|-----|
| Bitácoras (GEN1) | Registrar intentos de login / acciones (si está configurado) |
| Parámetros | Configuración adicional si aplica |

## Configuración

Claves principales en `appsettings.json` / variables de entorno:

- `ConnectionStrings:UsuariosDb` → Cadena de conexión a `Usuarios_DB`.
- `Jwt:ClaveSecreta` → Clave secreta para firmar JWT (**nunca versionar la real**).
- `Jwt:Issuer` → Emisor del token.
- `Jwt:Audience` → Audiencia del token.
- `Jwt:MinutosExpiracionAccessToken` → Duración del access token.
- `Jwt:MinutosExpiracionRefreshToken` → Duración del refresh token.

> **Nota de seguridad:** No versionar contraseñas, claves secretas JWT ni credenciales. Usar variables de entorno o secretos de Plesk en producción. Rotar la `ClaveSecreta` si se expuso.

## Base de datos

**Base de datos:** `Usuarios_DB`  
Tablas principales: Usuarios, RefreshTokens.

## Ejecución local

```bash
dotnet run --project Backend/MicroservicioLogin/MicroservicioLogin.csproj
```

## Respuestas y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Token válido (`/validate`) |
| 201 Created | Login o refresh exitoso |
| 401 Unauthorized | Credenciales incorrectas, token inválido/expirado/revocado o usuario inactivo |

## Diagrama de clases

![Diagrama de Clases Login](../../Documentacion/Diagramas%20Generales/Clases/Microservicios/DiagramaClases_Login.png)

---

*Documentación estandarizada del microservicio MicroservicioLogin (USR5).*
