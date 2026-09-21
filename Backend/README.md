# Backend – MetaU (Nuevo Avatar)

Este directorio contiene todos los microservicios del backend de **MetaU**, construidos con **.NET 10** y **ASP.NET Core (Minimal APIs)**.

Cada microservicio es independiente y puede desplegarse por separado.

> **Nota:**  
> - La documentación oficial de cada endpoint se irá agregando durante el desarrollo.  
> - El diagrama de clases de cada microservicio se incorporará próximamente y probablemente irá evolucionando.  
> - La URL base de cada microservicio se agregará más adelante.

---

## Tecnologías

- **.NET 10** + ASP.NET Core (Minimal APIs)
- **JWT** (autenticación y autorización)
- **SQL Server**
- **Entity Framework Core** y **Dapper** (según el microservicio)
- **Hosting**: Plesk

---

## Lista de Microservicios

### MicroservicioUsuarios
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/usuario`  
**Endpoints:**  
*(pendiente de definir)*  

Administra la identidad de los usuarios del sistema (creación, modificación, eliminación y consulta).

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioRoles
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/rol`  
**Endpoints:**  
*(pendiente de definir)*  

Gestiona los roles que se pueden asignar a los usuarios del sistema.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioParametros
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/parametro`  
**Endpoints:**  
*(pendiente de definir)*  

Administra los parámetros de configuración global del sistema.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioModulos
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/modulo`  
**Endpoints:**  
*(pendiente de definir)*  

Administra los módulos funcionales del sistema.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioLogin
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/login`  
**Endpoints:**  
*(pendiente de definir)*  

Maneja la autenticación de usuarios, generación y validación de tokens JWT, y renovación de sesiones.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioInstituciones
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/institucion`  
**Endpoints:**  
*(pendiente de definir)*  

Administra las instituciones educativas registradas en el sistema.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioCarreras
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/carrera`  
**Endpoints:**  
*(pendiente de definir)*  

Gestiona las carreras ofrecidas por las instituciones.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioCursos
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/curso`  
**Endpoints:**  
*(pendiente de definir)*  

Administra los cursos pertenecientes a las carreras.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioGrupos
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/grupo`  
**Endpoints:**  
*(pendiente de definir)*  

Gestiona los grupos de cursos, incluyendo profesor, horario, cupo y periodo.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioPeriodos
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/periodo`  
**Endpoints:**  
*(pendiente de definir)*  

Administra los periodos académicos del sistema.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioProfesores
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/profesor`  
**Endpoints:**  
*(pendiente de definir)*  

Administra los expedientes de los profesores.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioPreMatriculas
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/prematricula`  
**Endpoints:**  
*(pendiente de definir)*  

Gestiona el proceso de prematrícula de estudiantes.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioMatriculas
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/matricula`  
**Endpoints:**  
*(pendiente de definir)*  

Administra el proceso de matrícula formal de estudiantes.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioExpedientesEstudiantes
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/expediente`  
**Endpoints:**  
*(pendiente de definir)*  

Gestiona el expediente completo de los estudiantes (datos personales, dirección y teléfonos).

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioDirecciones
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/provincias`  
**Endpoints:**  
*(pendiente de definir)*  

Provee la información geográfica de Costa Rica (provincias, cantones y distritos).

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioNotas
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/notas`  
**Endpoints:**  
*(pendiente de definir)*  

Gestiona el desglose de rubros de evaluación y el registro de notas de los estudiantes.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioHistorialAcademico
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/historialacademico`  
**Endpoints:**  
*(pendiente de definir)*  

Consulta el historial académico de un estudiante (cursos y promedios obtenidos).

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioListaEstudiantes
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/listadoestudiantes`  
**Endpoints:**  
*(pendiente de definir)*  

Genera listados de estudiantes matriculados en un periodo específico.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioFacturacion
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/factura`  
**Endpoints:**  
*(pendiente de definir)*  

Genera y administra las facturas a partir de la matrícula de los estudiantes.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioPagos
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/pago`  
**Endpoints:**  
*(pendiente de definir)*  

Registra y gestiona los pagos realizados sobre las facturas.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioNotificaciones
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/notificar`  
**Endpoints:**  
*(pendiente de definir)*  

Envía notificaciones por correo electrónico de forma parametrizable.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

### MicroservicioBitacoras
**Responsable:** *(pendiente de asignar)*  
**URL base:** *(pendiente de definir)*  
**Endpoint base:** `/bitacora`  
**Endpoints:**  
*(pendiente de definir)*  

Registra de forma centralizada todas las acciones realizadas en el sistema para auditoría.

**Diagrama de clases:**  
*(pendiente de agregar)*

---

## Estructura de carpetas

```text
Backend/
|-- MicroservicioUsuarios/
|-- MicroservicioRoles/
|-- MicroservicioParametros/
|-- MicroservicioModulos/
|-- MicroservicioLogin/
|-- MicroservicioInstituciones/
|-- MicroservicioCarreras/
|-- MicroservicioCursos/
|-- MicroservicioGrupos/
|-- MicroservicioPeriodos/
|-- MicroservicioProfesores/
|-- MicroservicioPreMatriculas/
|-- MicroservicioMatriculas/
|-- MicroservicioExpedientesEstudiantes/
|-- MicroservicioDirecciones/
|-- MicroservicioNotas/
|-- MicroservicioHistorialAcademico/
|-- MicroservicioListaEstudiantes/
|-- MicroservicioFacturacion/
|-- MicroservicioPagos/
|-- MicroservicioNotificaciones/
|-- MicroservicioBitacoras/
|-- README.md # Este archivo