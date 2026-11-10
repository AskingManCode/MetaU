# Postman – MetaU

Archivos de Postman para consultar y probar los endpoints de los microservicios del backend de MetaU.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| [Backend MetaU.postman_collection.json](Backend%20MetaU.postman_collection.json) | Colección con solicitudes organizadas por microservicio. |
| [MicroserviciosBaseUrls.postman_environment.json](MicroserviciosBaseUrls.postman_environment.json) | Entorno con las URLs base de los servicios. Sus valores se exportan vacíos. |

La colección contiene solicitudes para 22 microservicios. La carpeta **API Gateway** está reservada y todavía no contiene solicitudes.

## Cómo usar la colección

1. Importa la colección y el entorno en Postman.
2. Selecciona el entorno **MicroserviciosBaseUrls**.
3. Edita el entorno y asigna la URL base de cada servicio que vayas a probar.
4. Abre la carpeta del microservicio, revisa la solicitud y envíala.

Usa URLs locales o de un entorno de pruebas. Configura la URL de origen con esquema, host y puerto si aplica, sin agregar el path de la solicitud ni una barra final. Por ejemplo:

```text
LoginBaseUrl = https://localhost:7001
```

Los nombres de las variables deben coincidir exactamente con los del entorno. Algunos conservan nombres históricos, como `ProfesoreBaseUrl` y `ListaEstudiantesUrl`.

## Autenticación

Las solicitudes `login` y `refresh` guardan `access_token` y `refresh_token` como variables globales de Postman cuando la respuesta contiene esos campos. `login` también guarda `UsuarioID`. La solicitud `refresh` utiliza `{{refresh_token}}`.

La configuración de autenticación varía entre solicitudes. Si recibes una respuesta `401` o `403`, revisa los requisitos del endpoint y su configuración en **Authorization**. Cuando corresponda, envía `{{access_token}}` como token de acceso.

## Consideraciones

- Las solicitudes `POST`, `PUT` y `DELETE` pueden modificar datos. Verifica el servicio y la base de datos de destino antes de enviarlas.
- Sustituye los identificadores y datos de ejemplo por valores válidos para tu entorno.
- No guardes ni compartas credenciales o tokens en archivos versionados.
- Para rutas, configuración y dependencias de cada API, consulta el README del microservicio correspondiente.

## Documentación relacionada

| Recurso | Ubicación |
|---------|-----------|
| Documentación general del backend | [README.md](../README.md) |
| Documentación general del proyecto | [README.md](../../README.md) |
