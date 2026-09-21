# MetaU - Propuesta Nuevo Avatar

Las instituciones educativas requieren sistemas que no solo administren información, sino que realmente faciliten el trabajo diario de estudiantes, docentes y personal administrativo.

**MetaU** nace como una respuesta moderna a esa necesidad. Se trata de una plataforma diseñada para reemplazar la actual solución **Avatar**, centralizando y automatizando los procesos más importantes de una institución: gestión de usuarios y roles, oferta académica, matrícula, control de notas, facturación y notificaciones.

Construida sobre una arquitectura de microservicios, **MetaU** busca ofrecer una solución accesible, segura y altamente escalable.

---

## Estado del Proyecto

El proyecto se encuentra actualmente en su fase inicial de desarrollo. 

**Milestone Actual: Fase 0 - Análisis, Documentación y Diseño Base**
> **Descripción:** Entrega de la documentación de análisis y diseño del equipo (enfocada en las HUs asignadas). Incluye: portada, introducción, diagrama completo de base de datos, diagramas de casos de uso, diagramas de clases, script de base de datos inicial y definición de la estructura de ramas Git (Main / Develop / Feature). Este milestone es transversal y debe cerrarse antes de iniciar la codificación de cualquier microservicio.
---

## Arquitectura y Tecnologías

El sistema está construido bajo una arquitectura de microservicios, lo que permite escalabilidad, mantenibilidad y despliegue independiente de cada componente.

* **Hosting:** Plesk.
* **Base de Datos:** SQL Server, alojada y administrada en el mismo entorno de hosting.
* **Backend:** Desarrollado en **.NET 10** utilizando **ASP.NET Core Web API** con un enfoque de **Minimal APIs** (sin controladores tradicionales), optimizando el rendimiento y la simplicidad del código.
* **Frontend:** (En desarrollo para futuros sprints) Aplicaciones Web y Móviles. 
* **Control de Versiones:** Git y GitHub.

[Diagramma de arquitectura de alto nivel del sistema](<Documentacion/Diagramas Generales/Diagrama de Arquitectura de MetaU.png>)

---

## Módulos del Sistema

El sistema está compuesto por una serie de microservicios independientes que cubren las siguientes áreas funcionales:

* ***Usuarios, Roles y Seguridad***
Administración de usuarios, roles y permisos. Incluye autenticación segura con tokens JWT, gestión de parámetros del sistema.

* **Oferta Académica**
Gestión de la estructura académica: instituciones, carreras, cursos, grupos, periodos y profesores. Permite definir la oferta educativa completa y mantener actualizada la información de los docentes.

* ***Matrícula y Expedientes***
Control del proceso de inscripción de estudiantes (prematrícula y matrícula formal), administración del expediente completo del estudiante y consulta de direcciones geográficas (provincias, cantones y distritos).

* **Módulo Académico**
Registro y consulta de notas, desglose de rubros de evaluación, historial académico de los estudiantes y listados de alumnos matriculados por periodo.

* **Pagos y Notificaciones**
Facturación automática a partir de la matrícula, gestión de pagos y reversiones, y envío de notificaciones por correo electrónico de forma parametrizable.

* **Bitácoras y Auditoría**
Registro centralizado de todas las acciones realizadas en el sistema (creaciones, modificaciones, eliminaciones y consultas), garantizando trazabilidad completa.

---

## Estructura del Repositorio

```text
/
|-- Backend/ # Código fuente de los microservicios
|   |-- MicroservicioBitacoras/
|   |-- MicroservicioCarreras/
|   |-- MicroservicioCursos/
|   |-- MicroservicioDirecciones/
|   |-- MicroservicioExpedientesEstudiantes/
|   |-- MicroservicioFacturacion/
|   |-- MicroservicioGrupos/
|   |-- MicroservicioHistorialAcademico/
|   |-- MicroservicioInstituciones/
|   |-- MicroservicioListaEstudiantes/
|   |-- MicroservicioLogin/
|   |-- MicroservicioMatriculas/
|   |-- MicroservicioModulos/
|   |-- MicroservicioNotas/
|   |-- MicroservicioNotificaciones/
|   |-- MicroservicioPagos/
|   |-- MicroservicioParametros/
|   |-- MicroservicioPeriodos/
|   |-- MicroservicioPreMatriculas/
|   |-- MicroservicioProfesores/
|   |-- README.md # Documentación específica del Backend
|
|-- Documentacion/ # Documentación formal del proyecto
|   |-- Diagramas Generales/ # Diagramas generales del sistema
|   |-- 0. Primer Sprint - Proyecto Nuevo Avatar.pdf
|   |-- 1. Story Points y Asignacion de Responsabilidades.xlsx
|   |-- 2. Manual_Flujo_Trabajo_Git (Acordado por el equipo).pdf
|   |-- 3. Documento_Analisis_y_Diseno_MetaU.docx # Estado actual: Primer sprint
|
|-- Frontend/ # Aplicaciones cliente (Futuros Sprints)
|   |-- App Movil/
|   |-- Sitio Web/
|   |-- README.md
|
|-- Pruebas Tecnicas/ # Evidencia de pruebas de aceptación (HUs)
|   |-- Documento_de_Evidencia_de_Pruebas_Tecnicas_Primer_Sprint.docx
|
|-- Scripts SQL/ # Scripts de base de datos por módulo
|   |-- Integracion_Pagos_DB/
|   |-- Matricula_DB/
|   |-- Modulo_Academico_DB/
|   |-- Notificaciones_DB/
|   |-- Oferta_Academica_DB/
|   |-- Reportes_Estadistica_DB/
|   |-- Seguridad_Auditoria_DB/
|   |-- Usuarios_Roles_DB/
|
|-- README.md # Este archivo
```
---

## Flujo de Trabajo (Git y GitHub)

Para garantizar la integridad del código y facilitar la colaboración, el equipo sigue un flujo de trabajo estandarizado. Todo el detalle se encuentra en el documento [Manual de Flujo de Trabajo con Git y GitHub](<Documentacion/2. Manual_Flujo_Trabajo_Git (Acordado por el equipo).pdf>) ubicado en la carpeta de documentación.

A continuación, un resumen de las reglas principales:

- ***Protección de Ramas Principales:*** Las ramas `main` y `develop` están ***permanentemente bloqueadas.*** No se permite hacer push directo a ninguna de ellas. Todo cambio debe integrarse exclusivamente a traves de un ***Pull Request (PR)*** que sea revisado, aprobado y mergeado por otro miembro del equipo.

- ***Nomenclatura de ramas:*** Toda rama de trabajo debe crearse a partir de la rama `develop` (o `main` en caso de ser un hotfix) y seguir el formato `tipo/numero-de-issie-descripcion-corta` (ej, `feat/12-nombre-corto`, `fix/45-correccion-error-x`).

- ***Convención de commits:*** Se utilizan ***Conventional Commits.*** Los mensajes deben incluir el número de issue (ej. `feat(api): descripción breve (#18)`). Se recomienda hacer commits atómicos.

- ***Pull Requests (PR):*** Todo PR debe describir claramente los cambios realizados, las decisiones tomadas y cómo probar la funcionalidad. Se requiere al menos una revisión y aprobación de otro miembro del equipo antes de hacer merge a la rama `develop`.

- ***Sincronización:*** Antes de crear una rama o abrir un PR, se debe hacer un `git pull origin develop` (o `git pull origin main`, depende de la intención y el contexto) para evitar conflictos.

- ***Cierre de issues:*** Los PR deben incluir `Closes: #XX` para cerrar automáticamente el tiquete correspondiente al ser mergeados.
---

## Equipo de Desarrollo

Este proyecto actualmente está siendo desarrollado por un equipo de 5 desarrolladores:

- Sebastián Jiménez Arrieta
- Brandon Steve Guido Navarro
- Sebastián Obando Ramirez
- Julián Solano Obando
- Anthony Emmanuel Gamboa Elizondo
---

## Documentación Adicional

Toda la documentación formal, incluyendo diagramas de casos de uso, diagramas de clases, modelo entidad-relación, análisis de requisitos y manuales de trabajo, se encuentra centralizada en la carpeta [Documentacion/](<Documentacion/>).

Para más detalles sobre el despliegue, configuración de la base de datos y pruebas técnicas, consulte los archivos `README.md` específicos dentro de cada directorio principal.




