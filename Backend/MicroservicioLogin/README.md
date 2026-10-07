# Microservicio de Login - USR5

Microservicio encargado de la autenticación de usuarios y la gestión de tokens de acceso y renovación del sistema MetaU.

## Historia de usuario

USR5 - Login.

El servicio permite autenticar usuarios mediante su nombre de usuario y contraseña, generar tokens JWT y refresh tokens, renovar sesiones y validar tokens de acceso.

## Tecnologias

* .NET 10
* Minimal API
* SQL Server
* Microsoft.Data.SqlClient
* Autenticacion mediante JWT Bearer Token
* Refresh Tokens
* Integracion con Microservicio de Bitacoras
* Integracion con Microservicio de Parametros

## Endpoint base

```text
/login
```

## Endpoints

### POST /login

Permite autenticar un usuario mediante su nombre de usuario y contraseña.

Los datos de autenticación se reciben mediante headers:

```text
usuario
contrasena
```

Si las credenciales son correctas, devuelve un `TokenResponse` con:

* AccessToken (JWT)
* RefreshToken
* ExpiresIn
* UsuarioID

Una autenticación incorrecta devuelve:

```text
401 Unauthorized
Usuario y/o contraseña incorrectos
```

### POST /refresh

Permite renovar el token de acceso utilizando un refresh token válido.

```text
/refresh
```

Un refresh token inválido, expirado o revocado devuelve:

```text
401 Unauthorized
```

### POST /validate

Permite validar un token JWT.

```text
/validate
```

Devuelve un resultado booleano indicando si el token es válido.

