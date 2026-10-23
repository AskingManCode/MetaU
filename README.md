# MetaU

Sistema de gestión académica basado en microservicios.

MetaU centraliza la administración de una institución educativa: usuarios, oferta académica, matrícula, notas, facturación, pagos y notificaciones. El objetivo es reemplazar procesos que actualmente se realizan con el sistema Avatar mediante una arquitectura de microservicios desacoplados.

## Estado actual

**Fase 7 — Despliegue en Plesk**

El backend se encuentra en proceso de publicación individual de cada microservicio en Plesk. Esta fase incluye:

- Configuración de variables de entorno y conexiones a base de datos.
- Publicación de los servicios REST.
- Verificación de endpoints públicos y validación de tokens JWT.
- Preparación del Pull Request final hacia la rama `main` con código estable.

En paralelo se está realizando la **planeación del frontend** (aplicación web y móvil).

### Fases completadas

| Fase | Nombre | Alcance principal |
|------|--------|-------------------|
| 0 | Análisis y diseño base | Documentación, diagramas y definición de alcance |
| 1 | Infraestructura transversal y seguridad | Bitácoras, Login/JWT, Usuarios, Roles, Parámetros, Módulos |
| 2 | Oferta académica | Instituciones, Carreras, Cursos, Grupos, Periodos, Profesores |
| 3 | Matrícula | Expedientes, Direcciones, Pre-matrícula, Matrícula, Notas |
| 4 | Consultas académicas | Historial académico, Listado de estudiantes |
| 5 | Pagos y notificaciones | Facturación, Pagos, Notificaciones por correo |
| 6 | Pruebas integradas | Pruebas técnicas, integración entre servicios y documentación final |

## Arquitectura

El sistema sigue un enfoque de microservicios independientes construidos con **.NET 10** y **ASP.NET Core Minimal APIs**. Cada servicio tiene su propia base de datos en SQL Server y se comunica mediante HTTP.

Los servicios de infraestructura (Login y Bitácoras) son consumidos por el resto de los microservicios para autenticación y auditoría.

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | .NET 10, ASP.NET Core (Minimal APIs) |
| Base de datos | SQL Server |
| Autenticación | JWT + Refresh Tokens |
| Hosting | Plesk |
| Control de versiones | Git / GitHub |
| Frontend | En planeación (web + móvil) |

## Estructura del repositorio

```
MetaU/
├── Backend/              # Microservicios .NET
├── Documentacion/        # Análisis, diseño y diagramas
├── Frontend/             # Planeación de aplicaciones web y móvil
├── Pruebas Tecnicas/     # Evidencia de pruebas por sprint
└── Scripts SQL/          # Scripts de creación de bases de datos
```

## Microservicios

| Servicio | Descripción |
|----------|-------------|
| Login | Autenticación, JWT y refresh tokens |
| Usuarios | Gestión de identidades |
| Roles | Roles y permisos |
| Parámetros | Configuración global del sistema |
| Módulos | Módulos funcionales |
| Bitácoras | Auditoría de acciones |
| Instituciones | Instituciones educativas |
| Carreras | Carreras por institución |
| Cursos | Cursos por carrera |
| Grupos | Grupos, horarios y cupos |
| Periodos | Periodos académicos |
| Profesores | Expedientes de profesores |
| Expedientes | Datos de estudiantes |
| Direcciones | Catálogo geográfico (CR) |
| Pre-matrícula | Proceso de prematrícula |
| Matrícula | Matrícula formal |
| Notas | Registro y desglose de notas |
| Historial Académico | Consulta de historial |
| Lista Estudiantes | Listados por periodo |
| Facturación | Generación de facturas |
| Pagos | Registro de pagos |
| Notificaciones | Envío de correos |

## Cómo ejecutar localmente

Requisito: **SDK de .NET 10**.

```bash
# Restaurar y compilar toda la solución
dotnet restore Backend/Microservicios.slnx
dotnet build Backend/Microservicios.slnx

# Ejecutar un microservicio (ejemplo: Login)
dotnet run --project Backend/MicroservicioLogin/MicroservicioLogin.csproj
```

Cada microservicio requiere configuración de cadena de conexión y variables de entorno (JWT, SMTP, etc.) antes de ejecutarse. Consulta el README de cada servicio o el [README del Backend](Backend/README.md) para más detalles.

## Flujo de trabajo

El equipo trabaja sobre la rama `develop`. Los cambios se integran mediante Pull Requests.  
Las reglas de ramas, commits y revisión están documentadas en:

- [Manual Flujo Trabajo Git (Acordado por el equipo)](Documentacion/0.%20Manual_Flujo_Trabajo_Git_(Acordado_por_el_equipo).pdf)

## Equipo

- Sebastián Jiménez Arrieta
- Brandon Steve Guido Navarro
- Sebastián Obando Ramírez
- Julián Solano Obando
- Anthony Emmanuel Gamboa Elizondo

## Documentación y recursos

| Recurso | Ubicación |
|---------|-----------|
| Análisis, diseño y diagramas | [Documentacion/](Documentacion/) (ver [Documentacion/README.md](Documentacion/README.md)) |
| Diagramas de arquitectura, casos de uso, clases y bases de datos | [Documentacion/Diagramas Generales](Documentacion/Diagramas%20Generales/) |
| Evidencia de pruebas técnicas | [Pruebas Tecnicas/](Pruebas%20Tecnicas/) |
| Scripts SQL y diagramas entidad-relación | [Scripts SQL/](Scripts%20SQL/) (ver [Scripts SQL/README.md](Scripts%20SQL/README.md)) |
| Detalle de cada microservicio (endpoints, configuración) | `Backend/Microservicio*/README.md` y [Backend/README.md](Backend/README.md) |
| Planeación del frontend | [Frontend/README.md](Frontend/README.md) |
