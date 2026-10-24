# Backend – MetaU

Microservicios del sistema MetaU construidos con **.NET 10** y **ASP.NET Core (Minimal APIs)**.

Cada microservicio es independiente, tiene su propia base de datos remota en SQL Server y puede desplegarse por separado en el servidor Plesk.

## Tecnologías

- .NET 10 + ASP.NET Core (Minimal APIs)
- Autenticación y autorización con JWT + Refresh Tokens
- SQL Server en Plesk
- Entity Framework Core y Dapper (según el servicio)
- Hosting: Plesk

## Solución

El archivo de solución es `Microservicios.slnx`.

```bash
# Restaurar y compilar todos los microservicios
dotnet restore Microservicios.slnx
dotnet build Microservicios.slnx
```

## Microservicios

| Carpeta | Endpoint base | Descripción |
|---------|---------------|-------------|
| [MicroservicioLogin/](MicroservicioLogin/) | `/login` | Autenticación, generación y validación de JWT, refresh tokens |
| [MicroservicioUsuarios/](MicroservicioUsuarios/) | `/usuario` | Administración de usuarios del sistema |
| [MicroservicioRoles/](MicroservicioRoles/) | `/rol` | Roles y permisos |
| [MicroservicioParametros/](MicroservicioParametros/) | `/api/parametro` | Parámetros de configuración global |
| [MicroservicioModulos/](MicroservicioModulos/) | `/modulo` | Módulos funcionales del sistema |
| [MicroservicioBitacoras/](MicroservicioBitacoras/) | `/bitacora` | Registro centralizado de acciones (auditoría) |
| [MicroservicioInstituciones/](MicroservicioInstituciones/) | `/institucion` | Instituciones educativas |
| [MicroservicioCarreras/](MicroservicioCarreras/) | `/carrera` | Carreras por institución |
| [MicroservicioCursos/](MicroservicioCursos/) | `/curso` | Cursos por carrera |
| [MicroservicioGrupos/](MicroservicioGrupos/) | `/grupo` | Grupos, horarios, cupos y periodos |
| [MicroservicioPeriodos/](MicroservicioPeriodos/) | `/periodo` | Periodos académicos |
| [MicroservicioProfesores/](MicroservicioProfesores/) | `/profesor` | Expedientes de profesores |
| [MicroservicioExpedientesEstudiantes/](MicroservicioExpedientesEstudiantes/) | `/expediente` | Datos personales, direcciones y teléfonos de estudiantes |
| [MicroservicioDirecciones/](MicroservicioDirecciones/) | `/api` | Catálogo geográfico de Costa Rica (provincias, cantones, distritos) |
| [MicroservicioPreMatriculas/](MicroservicioPreMatriculas/) | `/prematricula` | Proceso de prematrícula |
| [MicroservicioMatriculas/](MicroservicioMatriculas/) | `/matricula` | Matrícula formal |
| [MicroservicioNotas/](MicroservicioNotas/) | `/notas` | Desglose de rubros y registro de notas |
| [MicroservicioHistorialAcademico/](MicroservicioHistorialAcademico/) | `/historialacademico` | Consulta de historial y promedios |
| [MicroservicioListaEstudiantes/](MicroservicioListaEstudiantes/) | `/listadoestudiantes` | Listados de estudiantes |
| [MicroservicioFacturacion/](MicroservicioFacturacion/) | `/factura` | Generación y administración de facturas |
| [MicroservicioPagos/](MicroservicioPagos/) | `/pago` | Registro de pagos sobre facturas |
| [MicroservicioNotificaciones/](MicroservicioNotificaciones/) | `/api/notificar` | Envío de notificaciones por correo (SMTP) |

## Configuración

Cada microservicio se configura mediante:

- `appsettings.json` / `appsettings.Development.json`
- Variables de entorno (recomendado en producción)

Variables comunes que suelen requerirse:

- Cadenas de conexión a SQL Server (`ConnectionStrings__*`)
- Configuración JWT (`Jwt__ClaveSecreta`, `Jwt__Issuer`, `Jwt__Audience`)
- URLs de otros servicios (Login, Bitácoras, etc)
- Configuración SMTP (en Notificaciones)

## Ejecución local

Ejemplo con el microservicio de Login:

```bash
dotnet run --project MicroservicioLogin/MicroservicioLogin.csproj
```

Se recomienda revisar el `README.md` de cada carpeta `Microservicio*` para endpoints específicos, ejemplos de requests y detalles de configuración.

## Estructura típica de un microservicio

```
MicroservicioNombre/
├── Entities/           # Modelos de dominio y DTOs
├── Repository/         # Acceso a datos
├── Services/           # Lógica de negocio y clientes HTTP
├── *Endpoints.cs       # Definición de endpoints (Minimal APIs)
├── Program.cs
├── appsettings.json
└── README.md           # Documentación específica del servicio
```

## Documentación relacionada

| Recurso | Ubicación |
|---------|-----------|
| Documentación general del proyecto | [../README.md](../README.md) |
| Análisis, diseño y diagramas | [../Documentacion/](../Documentacion/) (ver [README](../Documentacion/README.md)) |
| Diagramas de clases por microservicio | [../Documentacion/Diagramas Generales/Clases/Microservicios/](../Documentacion/Diagramas%20Generales/Clases/Microservicios/) |
| Scripts SQL de las bases de datos | [../Scripts SQL/](../Scripts%20SQL/) (ver [README](../Scripts%20SQL/README.md)) |
| Evidencia de pruebas técnicas | [../Pruebas Tecnicas/](../Pruebas%20Tecnicas/) (ver [README](../Pruebas%20Tecnicas/README.md)) |

## Despliegue

Los microservicios se despliegan de forma individual en el servidor Plesk.  
Cada uno requiere:

- Configuración de variables de entorno
- Cadena de conexión a su base de datos
- Publicación del servicio REST
- Verificación de endpoints y validación de tokens JWT

---

Para detalles de endpoints, ejemplos de uso y configuración específica, consulta el `README.md` dentro de cada carpeta `Microservicio*`.
