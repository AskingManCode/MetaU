# API Gateway - GTW1

Punto único de entrada (*Reverse Proxy*) perimetral del sistema MetaU, construido sobre **.NET 10**, **ASP.NET Core (Minimal APIs)** y **YARP (Yet Another Reverse Proxy)**.

---

## Historia de usuario

**GTW1** — Configuración del Gateway como punto único de entrada.

El Gateway centraliza todas las comunicaciones entrantes destinadas al estudiante desde la Aplicación Móvil y el Portal Web desarrollados en Flutter. Proporciona un puerto y punto de entrada perimetral unificado, resolviendo el enrutamiento y la reescritura hacia los 20 microservicios en Plesk requeridos por el flujo del estudiante, filtrando verbos HTTP no autorizados y gestionando las políticas perimetrales de CORS.

> **Alcance arquitectónico:** El Sitio Web Administrativo (React 19) no consume este Gateway, ya que opera de forma interna y directa contra los microservicios administrativos.

---

## Tecnologías

- .NET 10
- ASP.NET Core Minimal APIs
- YARP (Yet Another Reverse Proxy) v2.3.0 de Microsoft
- Middleware de CORS (Cross-Origin Resource Sharing) configurable por entorno
- Transformaciones de ruta (*Path Pattern Transforms*) nativas
- Kestrel Web Server (HTTP/1.1 y HTTP/2)

---

## Endpoint base y puertos

`/gateway`

**URL base en producción:**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/ApiGateway_MetaU`

**URLs locales** (desde `Properties/launchSettings.json`):

- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`

---

## Endpoint propio de salud (Health Check)

El Gateway expone un endpoint declarativo de diagnóstico perimetral para validar su disponibilidad inmediata de forma autónoma sin consultar a los microservicios internos:

| Método | Ruta | Descripción | Respuesta exitosa |
|--------|------|-------------|-------------------|
| GET | `/gateway/health` | Estado de salud del Gateway | 200 OK |

### GET /gateway/health — Verificación de salud

```http
GET /gateway/health
```

**Respuesta exitosa (`200 OK`):**

```json
{
  "status": "Healthy",
  "service": "ApiGateway",
  "timestamp": "2026-11-20T20:00:00.0000000Z"
}
```

---

## Matriz de enrutamiento y dominios funcionales

El Gateway segmenta los 20 microservicios consumidos por la aplicación en 8 dominios funcionales obligatorios mediante comodines *catch-all* (`{**catch-all}`) y reglas de transformación de ruta (`PathPattern`):

| Dominio / Prefijo público | Verbos HTTP | Destino Cluster en Plesk | Ruta destino interna |
|---------------------------|:-----------:|--------------------------|----------------------|
| `/gateway/auth/{**catch-all}` | POST | `/MicroservicioLogin_MetaU` | `/{**catch-all}` |
| `/gateway/admin/usuario/{**catch-all}` | GET, PUT | `/MicroservicioUsuarios_MetaU` | `/usuario/{**catch-all}` |
| `/gateway/admin/rol/{**catch-all}` | GET | `/MicroservicioRoles_MetaU` | `/rol/{**catch-all}` |
| `/gateway/admin/parametro/{**catch-all}` | GET | `/MicroservicioParametros_MetaU` | `/api/parametro/{**catch-all}` |
| `/gateway/admin/bitacora/{**catch-all}` | POST | `/MicroservicioBitacoras_MetaU` | `/bitacora/{**catch-all}` |
| `/gateway/academic/institucion/{**catch-all}` | GET | `/MicroservicioInstituciones_MetaU` | `/institucion/{**catch-all}` |
| `/gateway/academic/carrera/{**catch-all}` | GET | `/MicroservicioCarreras_MetaU` | `/carrera/{**catch-all}` |
| `/gateway/academic/curso/{**catch-all}` | GET | `/MicroservicioCursos_MetaU` | `/curso/{**catch-all}` |
| `/gateway/academic/grupo/{**catch-all}` | GET | `/MicroservicioGrupos_MetaU` | `/grupo/{**catch-all}` |
| `/gateway/academic/periodo/{**catch-all}` | GET | `/MicroservicioPeriodos_MetaU` | `/periodo/{**catch-all}` |
| `/gateway/academic/profesor/{**catch-all}` | GET | `/MicroservicioProfesores_MetaU` | `/profesor/{**catch-all}` |
| `/gateway/enrollment/expediente/{**catch-all}` | GET, PUT | `/MicroservicioExpedientesEstudiantes_MetaU` | `/expediente/{**catch-all}` |
| `/gateway/enrollment/prematricula/{**catch-all}` | GET, POST | `/MicroservicioPreMatriculas_MetaU` | `/prematricula/{**catch-all}` |
| `/gateway/enrollment/matricula/{**catch-all}` | GET, POST | `/MicroservicioMatriculas_MetaU` | `/matricula/{**catch-all}` |
| `/gateway/grades/notas/{**catch-all}` | GET | `/MicroservicioNotas_MetaU` | `/{**catch-all}` |
| `/gateway/grades/historial/{**catch-all}` | GET | `/MicroservicioHistorialAcademico_MetaU` | `/historialacademico` |
| `/gateway/finance/factura/{**catch-all}` | GET | `/MicroservicioFacturacion_MetaU` | `/api/factura/{**catch-all}` |
| `/gateway/finance/pago/{**catch-all}` | GET, POST | `/MicroservicioPagos_MetaU` | `/api/pago/{**catch-all}` |
| `/gateway/location/{**catch-all}` | GET | `/MicroservicioDirecciones_MetaU` | `/api/{**catch-all}` |
| `/gateway/notifications/{**catch-all}` | POST | `/MicroservicioNotificaciones_MetaU` | `/api/notificar/{**catch-all}` |

---

## Políticas de CORS (Cross-Origin Resource Sharing)

El Gateway implementa la política perimetral `GatewayCorsPolicy` posicionada de forma estricta antes del proxy inverso en el pipeline de ASP.NET Core:

1. **Orígenes dinámicos:** Los orígenes permitidos se desacoplan del código compilado y se configuran en `appsettings.json` mediante la clave `Cors:AllowedOrigins` (por ejemplo, `https://tiusr20pl.cuc-carrera-ti.ac.cr`).
2. **Cabeceras permitidas:** `AllowAnyHeader()` para permitir cabeceras estándar y personalizadas (`Authorization`, `Content-Type`, `X-Usuario-Id`, `UsuarioGUID`, etc.).
3. **Métodos permitidos:** `AllowAnyMethod()` para resolver con éxito el preflight (`OPTIONS` -> `204 No Content`), delegando la restricción granular de verbos de negocio al Route Matcher de YARP.
4. **Comportamiento móvil vs web:** Las aplicaciones nativas (Flutter en Android/iOS) operan a nivel de socket del sistema operativo y no están restringidas por CORS. La política protege a los clientes ejecutados en navegador (específicamente la versión Flutter Web del estudiante).

---

## Configuración

Claves principales en `appsettings.json` / `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Yarp": "Information"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "https://tiusr20pl.cuc-carrera-ti.ac.cr"
    ]
  },
  "ReverseProxy": {
    "Routes": { ... },
    "Clusters": { ... }
  }
}
```

- `Cors:AllowedOrigins` → Lista de dominios web autorizados para interactuar con la API.
- `ReverseProxy:Routes` → Definición de rutas públicas, verbos admitidos y reglas de transformación.
- `ReverseProxy:Clusters` → Destinos físicos correspondientes a cada microservicio publicado en Plesk.
- `Logging:LogLevel:Yarp` → Nivel `Information` para auditoría y trazabilidad en consola de cada redirección.

---

## Ejecución local

Para iniciar el Gateway de forma independiente:

```bash
dotnet run --project Backend/ApiGateway/ApiGateway.csproj
```

Para ejecutarlo dentro de la solución completa, está incorporado en `Microservicios.slnx` y configurado en el perfil de inicio múltiple `Microservicios.slnLaunch`.

---

## Códigos de respuesta y errores comunes

| Código | Cuándo ocurre |
|--------|---------------|
| 200 OK | Solicitud procesada y respondida exitosamente por el microservicio o por `/gateway/health` |
| 201 Created | Creación de recursos exitosa (ej. login, prematricula, pago) |
| 204 No Content | Petición preflight `OPTIONS` resuelta por CORS o eliminaciones exitosas |
| 401 Unauthorized | Token JWT ausente, expirado o inválido transmitido al microservicio |
| 404 Not Found | Ruta inexistente no capturada por ninguna regla de enrutamiento |
| 405 Method Not Allowed | Verbo HTTP no autorizado por la definición de la ruta en YARP (bloqueo en el perímetro) |
| 502 Bad Gateway | El microservicio interno de destino en Plesk está apagado, inaccesible o la URL configurada en el Cluster es errónea |

---

## Diagrama de casos de uso

El diagrama de casos de uso del API Gateway se encuentra disponible en:

`Documentacion/Diagramas Generales/Casos de Uso/Diagrama_Casos_Uso_APIGateway.drawio.png`

---

*Documentación estandarizada del componente ApiGateway (GTW1).*
