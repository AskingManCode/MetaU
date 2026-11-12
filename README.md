# MetaU

Sistema de gestión académica y financiera basado en una arquitectura de microservicios.

MetaU centraliza la administración integral de una institución educativa: usuarios, roles, oferta académica, matrícula, notas, facturación, pagos y notificaciones. El objetivo principal es modernizar y reemplazar los flujos tradicionales del sistema Avatar mediante microservicios desacoplados y una interfaz web moderna y responsiva.

---

## Acceso en Producción

El sistema completo se encuentra desplegado y en funcionamiento en el servidor institucional Plesk:

🌐 **[Acceso al Sitio Web Administrativo MetaU](https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU)**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU`

---

## Estado Actual del Proyecto

El desarrollo del Backend (22 microservicios) y la integración del **Sitio Web Administrativo** (Frontend) se encuentran finalizados y desplegados en el servidor Plesk.

### Fases del Proyecto

| Fase | Nombre | Alcance principal | Estado |
|:----:|--------|-------------------|:------:|
| 0 | Análisis y diseño base | Documentación, diagramas y definición de alcance | Completado |
| 1 | Infraestructura transversal y seguridad | Bitácoras, Login/JWT, Usuarios, Roles, Parámetros, Módulos | Completado |
| 2 | Oferta académica | Instituciones, Carreras, Cursos, Grupos, Periodos, Profesores | Completado |
| 3 | Matrícula | Expedientes, Direcciones, Pre-matrícula, Matrícula, Notas | Completado |
| 4 | Consultas académicas | Historial académico, Listado de estudiantes | Completado |
| 5 | Pagos y notificaciones | Facturación, Pagos, Notificaciones por correo (SMTP) | Completado |
| 6 | Pruebas técnicas integradas | Validación de endpoints, seguridad JWT, flujos completos y evidencias | Completado |
| 7 | Despliegue de Backend en Plesk | Publicación y puesta en marcha de los 22 microservicios en SQL Server y Plesk | Completado |
| 8 | Desarrollo del Sitio Web Administrativo | Creación de interfaz en React 19 + Vite, diseño de layout y conexión de pantallas | Completado |
| 9 | Despliegue y publicación del Frontend | Alojamiento en Plesk del Sitio Web Administrativo y pruebas en producción | Completado |

---

## Arquitectura

El sistema implementa una arquitectura desacoplada y orientada a servicios:

1. **Backend:** 22 microservicios independientes desarrollados con **.NET 10** y **ASP.NET Core Minimal APIs**. Cada servicio administra su propia base de datos en SQL Server y expone endpoints REST bajo autenticación con JWT.
2. **Frontend:** Aplicación web SPA desarrollada con **React 19** y empaquetada con **Vite 8**, que interactúa con los microservicios mediante peticiones asíncronas vía Axios.
3. **Seguridad Transversal:** El microservicio de Login emite y valida tokens JWT junto con Refresh Tokens; los eventos y operaciones se auditan de manera centralizada en el microservicio de Bitácoras.

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19, Vite 8, React Router DOM 7, React-Bootstrap, Bootstrap 5, Axios |
| **Backend** | .NET 10, ASP.NET Core (Minimal APIs), C# |
| **Bases de Datos** | SQL Server (Instancias dedicadas por microservicio/dominio) |
| **Autenticación** | JWT (JSON Web Tokens) + Refresh Tokens + RBAC |
| **Hosting y Despliegue** | Servidor Plesk ([Sitio Web en línea](https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU)) |
| **Control de Versiones** | Git y GitHub (Metodología GitFlow / PRs) |

---

## Estructura del Repositorio

```
MetaU/
├── Backend/              # Microservicios .NET 10, solución y Postman
├── Documentacion/        # Análisis, diseño consolidado, acuerdos y diagramas
├── Frontend/             # Aplicaciones cliente (Sitio Web Administrativo en React + Vite)
├── Pruebas Tecnicas/     # Evidencia y reportes de pruebas técnicas por sprint
└── Scripts SQL/          # Scripts de creación de bases de datos y esquemas ER
```

---

## Microservicios del Backend

| Servicio | Endpoint Base | Descripción |
|----------|---------------|-------------|
| **Login** | `/login` | Autenticación, generación y renovación de JWT y refresh tokens |
| **Usuarios** | `/usuario` | Administración de identidades y credenciales de usuario |
| **Roles** | `/rol` | Roles, permisos y asignación a usuarios (RBAC) |
| **Parámetros** | `/api/parametro` | Configuración de parámetros globales del sistema |
| **Módulos** | `/modulo` | Registro y control de módulos del sistema |
| **Bitácoras** | `/bitacora` | Registro de auditoría y trazabilidad de eventos |
| **Instituciones** | `/institucion` | Gestión de instituciones y sedes educativas |
| **Carreras** | `/carrera` | Carreras y planes de estudio por institución |
| **Cursos** | `/curso` | Catálogo de materias, créditos y requisitos |
| **Grupos** | `/grupo` | Apertura de grupos, asignación de horarios, aulas y cupos |
| **Periodos** | `/periodo` | Ciclos lectivos (cuatrimestres, semestres) |
| **Profesores** | `/profesor` | Expedientes de docentes y vinculación académica |
| **Expedientes** | `/expediente` | Datos personales, teléfonos y direcciones de estudiantes |
| **Direcciones** | `/api` | Catálogo territorial de Costa Rica (provincias, cantones, distritos) |
| **Pre-matrícula** | `/prematricula` | Registro de solicitudes previas de materias |
| **Matrícula** | `/matricula` | Matrícula formal y asignación de materias |
| **Notas** | `/notas` | Registro de notas y desglose por rubros evaluativos |
| **Historial Académico** | `/historialacademico` | Consulta de notas históricas y cálculo de promedios |
| **Lista Estudiantes** | `/listadoestudiantes` | Reportes y listas de estudiantes por periodo |
| **Facturación** | `/factura` | Emisión, detalle y consulta de facturas |
| **Pagos** | `/pago` | Registro de transacciones y comprobantes de pago |
| **Notificaciones** | `/api/notificar` | Envío de notificaciones y correos vía SMTP |

---

## Cómo Ejecutar Localmente

### 1. Backend (.NET 10)
Requisito: **SDK de .NET 10**.

```bash
# Restaurar dependencias y compilar la solución completa
dotnet restore Backend/Microservicios.slnx
dotnet build Backend/Microservicios.slnx

# Ejecutar un microservicio en específico (ejemplo: Login)
dotnet run --project Backend/MicroservicioLogin/MicroservicioLogin.csproj
```

### 2. Frontend (Sitio Web Administrativo)
Requisitos: **Node.js 18+** y **npm**.

```bash
# Navegar a la carpeta del sitio web
cd Frontend/SitioWeb

# Copiar la plantilla de variables de entorno y configurar los endpoints
cp .env.example .env

# Instalar dependencias e iniciar el servidor de desarrollo
npm install
npm run dev
```

La aplicación web estará disponible en `http://localhost:5173`.

---

## Flujo de Trabajo y Buenas Prácticas

El equipo trabaja siguiendo la metodología basada en ramas de características y la rama integradora `develop`, validando cambios mediante Pull Requests.  
Las normas y acuerdos se encuentran documentados en:

- [Manual de Flujo de Trabajo Git](Documentacion/0.%20Manual_Flujo_Trabajo_Git_(Acordado_por_el_equipo).pdf)

---

## Documentación y Enlaces del Proyecto

| Recurso | Ubicación |
|---------|-----------|
| **Sitio Web en Producción** | [Acceso Web Administrativo](https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU) |
| **Documentación de Frontend** | [Frontend/README.md](Frontend/README.md) · [Frontend/SitioWeb/README.md](Frontend/SitioWeb/README.md) |
| **Documentación de Backend** | [Backend/README.md](Backend/README.md) (y `Backend/Microservicio*/README.md`) |
| **Colección de Postman** | [Backend/Postman/README.md](Backend/Postman/README.md) |
| **Documentos de Análisis y Diseño** | [Documentacion/README.md](Documentacion/README.md) |
| **Diagramas de Arquitectura y Clases** | [Documentacion/Diagramas Generales/](Documentacion/Diagramas%20Generales/) |
| **Evidencias de Pruebas Técnicas** | [Pruebas Tecnicas/README.md](Pruebas%20Tecnicas/README.md) |
| **Bases de Datos y Scripts SQL** | [Scripts SQL/README.md](Scripts%20SQL/README.md) |

---

## Equipo de Desarrollo

- Sebastián Jiménez Arrieta
- Brandon Steve Guido Navarro
- Sebastián Obando Ramírez
- Julián Solano Obando
- Anthony Emmanuel Gamboa Elizondo
