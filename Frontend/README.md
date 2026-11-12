# Frontend – MetaU

Capa de presentación del sistema MetaU. Consume los microservicios del Backend y expone las interfaces gráficas a los distintos tipos de usuarios del entorno educativo.

---

## Aplicaciones del Sistema

| Aplicación | Descripción | Tecnología | Estado | Enlace / Ubicación |
|------------|-------------|------------|--------|--------------------|
| **Sitio Web Administrativo** | Aplicación web integral para personal administrativo, docentes y gestión del sistema | **React 19 + Vite 8** | **Completado y Desplegado** | [SitioWeb/](SitioWeb/) · [Acceso en Producción](https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU) |
| **App Móvil** | Aplicación móvil orientada principalmente a estudiantes y profesores | *Por definir* | En planeación | Próxima fase |

---

## Acceso en Producción (Sitio Web Administrativo)

El Sitio Web Administrativo se encuentra alojado y funcionando en el servidor institucional Plesk:

🌐 **URL de Producción:**  
**[https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU/login](https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU)**

---

## Estructura de la Carpeta

```
Frontend/
├── README.md               # Este documento
└── SitioWeb/               # Código fuente del Sitio Web Administrativo (React + Vite)
    ├── src/                # Componentes, vistas, servicios y lógica
    ├── package.json        # Dependencias y scripts
    ├── .env.example        # Variables de entorno requeridas
    └── README.md           # Documentación técnica específica del Sitio Web
```

---

## Principios de Diseño

- **Capa desacoplada:** El frontend actúa estrictamente como consumidor de servicios; la lógica de negocio y persistencia residen exclusivamente en los microservicios del Backend.
- **Consumo directo REST:** La aplicación web consume los endpoints REST expuestos por los microservicios en Plesk o en entornos locales.
- **Seguridad mediante JWT:** Se respetan los mecanismos de autenticación y renovación de tokens (JWT + Refresh Tokens) emitidos por el microservicio de Login.
- **Control de Acceso basado en Roles (RBAC):** Las vistas y componentes se habilitan dinámicamente según los roles y permisos del usuario autenticado.

---

## Relación con el Resto del Proyecto

| Recurso | Ubicación |
|---------|-----------|
| Documentación general del proyecto | [../README.md](../README.md) |
| Guía detallada del Sitio Web Administrativo | [SitioWeb/README.md](SitioWeb/README.md) |
| Detalle de microservicios y endpoints | [../Backend/README.md](../Backend/README.md) |
| Análisis, diseño y diagramas del sistema | [../Documentacion/README.md](../Documentacion/README.md) |
| Evidencias de pruebas técnicas | [../Pruebas Tecnicas/README.md](../Pruebas%20Tecnicas/README.md) |
| Scripts de base de datos | [../Scripts SQL/README.md](../Scripts%20SQL/README.md) |
