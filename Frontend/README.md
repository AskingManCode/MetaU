# Frontend – MetaU

Capa de presentación del sistema MetaU. Consume los microservicios del Backend y expone las funcionalidades a usuarios finales.

Actualmente se encuentra en **fase de planeación**.

## Aplicaciones planificadas

| Aplicación | Descripción | Tecnología | Estado |
|------------|-------------|------------|--------|
| Sitio Web Administrativo | Aplicación web para personal administrativo, profesores y gestión del sistema | **React** | En planeación |
| App Móvil | Aplicación móvil orientada principalmente a estudiantes y profesores | Pendiente de definir | En planeación |

## Tecnologías

| Plataforma | Tecnología | Notas |
|------------|------------|-------|
| Web (Administrativo) | React | Consumirá directamente los microservicios del Backend vía REST |
| Móvil | Pendiente de definir | — |

## Principios

- El frontend es únicamente una capa de presentación.
- Toda la lógica de negocio reside en los microservicios del Backend.
- El sitio web administrativo consumirá los endpoints REST de forma directa.
- Se respetarán los mecanismos de autenticación (JWT) definidos en los microservicios.

## Relación con el resto del proyecto

| Recurso | Ubicación |
|---------|-----------|
| Documentación general del proyecto | [../README.md](../README.md) |
| Detalle de microservicios y endpoints | [../Backend/README.md](../Backend/README.md) |
| Análisis, diseño y diagramas | [../Documentacion/README.md](../Documentacion/README.md) |
| Diagramas de clases del frontend | [../Documentacion/Diagramas Generales/Clases/](../Documentacion/Diagramas%20Generales/Clases/) |
| Documento de sprints y requisitos | [../Documentacion/4. Segundo_y_Tercer_Sprint-Proyecto_Nuevo_Avatar_V2.pdf](../Documentacion/4.%20Segundo_y_Tercer_Sprint-Proyecto_Nuevo_Avatar_V2.pdf) |

---

La documentación detallada de arquitectura, componentes y flujos de cada aplicación se agregará una vez inicie el desarrollo.
