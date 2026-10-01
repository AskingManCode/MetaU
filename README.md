# MetaU - Nuevo Avatar

MetaU es un proyecto para apoyar la administración de una institución educativa. La idea es reunir en un solo sistema cosas como usuarios, matrícula, notas, pagos y notificaciones, que actualmente se hacen usando Avatar.

El sistema se está construyendo con microservicios para separar las partes. Todavía estamos desarrollando el proyecto, así que algunas funciones y decisiones pueden cambiar.

## Estado del proyecto

La **Fase 0 - Análisis, documentación y diseño base** ya está finalizada. Ahora estamos en la **Fase 1 - Infraestructura transversal y seguridad**.

En la Fase 1 se van a desarrollar los servicios que necesitan los demás módulos:

| HU | Servicio | Alcance |
| --- | --- | --- |
| GEN1 | Bitácoras | Guardar las acciones que se hacen en el sistema. |
| USR5 | Login | Inicio de sesión, JWT, refresh tokens y validación de token. |
| USR1 | Usuarios | Administración de usuarios. |
| USR2 | Roles | Administración de roles y permisos. |
| USR3 | Parametrización | Configuración de parámetros del sistema. |
| USR4 | Módulos | Administración de los módulos disponibles. |

También se harán pruebas técnicas individuales para cada HU. Para cerrar esta fase, los servicios deben quedar estables y desplegados, y se debe comprobar el registro en bitácoras y la validación de tokens. Después de eso se continuará con los módulos de negocio.

## Qué incluye el sistema

Además de los servicios de la fase actual, el proyecto contempla:

- Oferta académica, como instituciones, carreras, cursos, grupos y periodos.
- Matrícula y expedientes de estudiantes, incluyendo prematrícula.
- Notas e historial académico.
- Facturación, pagos y notificaciones.

## Tecnologías

- **Backend:** .NET 10 y ASP.NET Core Web API.
- **Base de datos:** SQL Server.
- **Hosting previsto:** Plesk.
- **Control de versiones:** Git y GitHub.
- **Frontend:** se planean un sitio web y una aplicación móvil; las tecnologías todavía están por definirse.

[Ver el diagrama de arquitectura](<Documentacion/Diagramas Generales/Diagrama de Arquitectura de MetaU.png>)

## Cómo empezar

Para compilar el backend se necesita tener instalado el **SDK de .NET 10**. Desde la carpeta raíz del repositorio se puede ejecutar:

```bash
dotnet restore Backend/Microservicios.slnx
dotnet build Backend/Microservicios.slnx
```

Para ejecutar un servicio individual, por ejemplo Login:

```bash
dotnet run --project Backend/MicroservicioLogin/MicroservicioLogin.csproj
```

La configuración y los detalles de cada microservicio se deben revisar antes de ejecutarlo. En el [README del Backend](Backend/README.md) está la lista de servicios y su descripción.

## Estructura del repositorio

- [`Backend/`](Backend/): código de los microservicios y la solución .NET.
- [`Documentacion/`](Documentacion/): análisis, diagramas y documentos del proyecto. Consulta su [README](Documentacion/README.md) para encontrar los archivos.
- [`Frontend/`](Frontend/): documentación inicial del sitio web y la aplicación móvil.
- [`Pruebas Tecnicas/`](Pruebas%20Tecnicas/): evidencia de pruebas técnicas.
- [`Scripts SQL/`](Scripts%20SQL/): scripts de base de datos. Consulta su [README](Scripts%20SQL/README.md) antes de usarlos.

## Trabajo con Git

El equipo trabaja a partir de `develop`; los cambios se integran mediante Pull Requests y no se hacen cambios directos en las ramas principales. Las ramas de trabajo deben seguir el formato acordado por el equipo y los PR deben indicar cómo probar los cambios. Las reglas completas están en el [manual de flujo de trabajo con Git](<Documentacion/2. Manual_Flujo_Trabajo_Git (Acordado por el equipo).pdf>).

## Equipo

- Sebastián Jiménez Arrieta
- Brandon Steve Guido Navarro
- Sebastián Obando Ramírez
- Julián Solano Obando
- Anthony Emmanuel Gamboa Elizondo
