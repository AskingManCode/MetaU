# Sitio Web Administrativo – MetaU

Aplicación web frontend que provee la interfaz administrativa para el sistema académico y financiero **MetaU**, comunicándose directamente con la arquitectura de microservicios en el Backend.

---

## Acceso en Producción

El sitio web administrativo se encuentra desplegado y accesible públicamente en el servidor institucional Plesk:

🔗 **[Website Administrativo MetaU en Plesk](https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU)**  
`https://tiusr20pl.cuc-carrera-ti.ac.cr/WebsiteAdministrativo_MetaU`

> **Estado del despliegue:** Todas las fases de frontend (Fases 8 a 15) han sido completadas, abarcando la totalidad de Historias de Usuario administrativas (**ADM1 a ADM24**) con sus respectivas pruebas técnicas e integración total con los 22 microservicios.

---

## Tecnologías

- **React 19** (`react`, `react-dom`): Biblioteca para la construcción de interfaces de usuario interactivas.
- **Vite 8**: Herramienta de compilación rápida y servidor de desarrollo con HMR.
- **React Router DOM 7**: Enrutador declarativo para la navegación SPA, compatible con sub-rutas y basename.
- **React-Bootstrap & Bootstrap 5**: Sistema de componentes y diseño responsivo para formularios, tablas, modales y tarjetas.
- **Bootstrap Icons**: Iconografía institucional integrada.
- **Axios**: Cliente HTTP para el consumo de los microservicios REST del backend.

---

## Módulos y Funcionalidades

El sitio web administrativo cuenta con una interfaz centralizada y organizada en módulos funcionales protegidos por autenticación:

### 1. Autenticación y Perfil
- **Login (`/login`):** Inicio de sesión mediante credenciales institucionales, generación de tokens JWT y refresh tokens.
- **Mi Perfil (`/perfil`):** Visualización de información del usuario en sesión, roles asignados y opciones de cuenta.
- **Rutas Protegidas (`ProtectedRoute`):** Control estricto de acceso que valida la presencia y vigencia del token de sesión.

### 2. Panel Principal (Dashboard)
- **Inicio (`/`):** Métricas generales, accesos directos y estado global del sistema académico.

### 3. Oferta Académica
- **Instituciones (`/instituciones`):** Registro, consulta y actualización de sedes o instituciones.
- **Carreras (`/carreras`):** Catálogo de programas académicos vinculados a cada institución.
- **Cursos (`/cursos`):** Mantenimiento de materias, créditos, códigos y horas lectivas.
- **Grupos (`/grupos`):** Apertura de grupos por curso, asignación de horarios, cupos y aulas.
- **Periodos (`/periodos`):** Ciclos lectivos (cuatrimestres, semestres) y fechas límite de procesos.

### 4. Personas y Expedientes
- **Profesores (`/profesores`):** Gestión de cuerpo docente, especialidades y vinculación académica.
- **Expedientes de Estudiantes (`/expedientes`):** Fichas estudiantiles completas: datos personales, ubicación geográfica y teléfonos de contacto.

### 5. Matrícula
- **Pre-matrícula (`/prematricula`):** Registro y validación de intenciones de matrícula por estudiante y periodo.
- **Matrícula (`/matricula`):** Formalización de matrícula de cursos y confirmación de cupo.

### 6. Evaluación y Consultas Académicas
- **Notas (`/notas`):** Registro de calificaciones, desglose por rubros evaluativos y cálculo automático.
- **Listados de Estudiantes (`/listados`):** Reportes y listas de asistencia por grupo y periodo.
- **Historial Académico (`/historial`):** Consulta integral de notas históricas y promedios acumulados.

### 7. Finanzas
- **Facturas (`/facturas`):** Emisión, anulación, consulta y detalle de facturas generadas por conceptos de matrícula y aranceles.
- **Pagos (`/pagos`):** Registro de pagos recibidos, conciliación y comprobantes.

### 8. Comunicación
- **Notificaciones (`/notificaciones`):** Historial y envío manual o automatizado de notificaciones y correos a la comunidad universitaria.

### 9. Sistema y Seguridad
- **Usuarios (`/usuarios`):** Mantenimiento integral de cuentas de usuario, reseteo de claves y asignación de correo.
- **Roles y Permisos (`/roles`):** Control de acceso basado en roles (RBAC) y asignación detallada de permisos.
- **Módulos (`/modulos`):** Habilitación y configuración de módulos funcionales visibles en el sistema.
- **Parámetros (`/parametros`):** Configuración de variables globales del sistema educativo.
- **Bitácoras (`/bitacoras`):** Auditoría en tiempo real de acciones realizadas en los microservicios.

---

## Estructura del Proyecto

```
Frontend/SitioWeb/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/             # Imágenes, logos e ilustraciones
│   ├── components/         # Componentes transversales (Sidebar, Navbar, ProtectedRoute)
│   ├── context/            # Contextos de React (AuthContext para sesión y JWT)
│   ├── hooks/              # Custom React Hooks
│   ├── layouts/            # Plantillas maestras (MainLayout)
│   ├── pages/              # Pantallas organizadas por módulo funcional
│   │   ├── Comunicacion/   # Notificaciones
│   │   ├── Dashboard/      # Vista principal
│   │   ├── Evaluacion/     # Notas, listados e historial
│   │   ├── Finanzas/       # Facturas y pagos
│   │   ├── Login/          # Inicio de sesión
│   │   ├── Matricula/      # Prematrícula y matrícula
│   │   ├── MiPerfil/       # Perfil de usuario
│   │   ├── OfertaAcademica/# Instituciones, carreras, cursos, grupos, periodos
│   │   ├── Personas/       # Profesores y expedientes
│   │   └── Sistema/        # Usuarios, roles, módulos, parámetros y bitácoras
│   ├── services/           # Clientes HTTP y llamadas a endpoints por microservicio
│   ├── styles/             # Hojas de estilo personalizadas
│   ├── utils/              # Validadores, formateadores de fecha y constantes
│   ├── App.jsx             # Definición de rutas principales
│   └── main.jsx            # Punto de entrada de la aplicación
├── .env.example            # Plantilla de variables de entorno (URLs de microservicios)
├── package.json            # Dependencias y scripts
└── vite.config.js          # Configuración de Vite
```

---

## Configuración y Ejecución Local

### 1. Requisitos previos
- **Node.js** (versión 18 o superior recomendada)
- **npm** (o gestor de paquetes preferido)

### 2. Configurar variables de entorno
Copia el archivo de plantilla `.env.example` como `.env` en la raíz de `Frontend/SitioWeb/`:

```bash
cp .env.example .env
```

Configura en el archivo `.env` las URLs base locales o de desarrollo para los microservicios (por ejemplo, `VITE_URL_LOGIN=http://localhost:57075`, etc.).

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación se ejecutará de forma predeterminada en `http://localhost:5173`.

### 5. Compilar para producción
```bash
npm run build
```

El resultado se generará en la carpeta `dist/`, listo para ser desplegado en servidores web como Plesk, IIS o Nginx.

---

## Documentación Relacionada

| Recurso | Ubicación |
|---------|-----------|
| Documentación de la capa Frontend | [../README.md](../README.md) |
| Documentación general del proyecto | [../../README.md](../../README.md) |
| Microservicios y endpoints del Backend | [../../Backend/README.md](../../Backend/README.md) |
| Análisis, diseño y diagramas del sistema | [../../Documentacion/README.md](../../Documentacion/README.md) |
| Evidencias de pruebas técnicas | [../../Pruebas Tecnicas/README.md](../../Pruebas%20Tecnicas/README.md) |
