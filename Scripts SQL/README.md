# Scripts SQL – MetaU

Scripts de creación de bases de datos y diagramas entidad-relación del sistema MetaU.

Cada base de datos corresponde a uno o más microservicios y se organiza en su propia carpeta.

## Bases de datos

| Carpeta | Base de datos | Uso principal |
|---------|---------------|---------------|
| [Usuarios_DB/](Usuarios_DB/) | Usuarios | Usuarios, roles y permisos |
| [Configuraciones_DB/](Configuraciones_DB/) | Configuraciones | Parámetros y módulos del sistema |
| [Seguridad_Auditoria_DB/](Seguridad_Auditoria_DB/) | Seguridad / Auditoría | Bitácoras y logs de acciones |
| [Oferta_Academica_DB/](Oferta_Academica_DB/) | Oferta Académica | Instituciones, carreras, cursos, grupos, periodos y profesores |
| [Matriculas_DB/](Matriculas_DB/) | Matrículas | Expedientes, prematrícula y matrícula |
| [Notas_Academicas_DB/](Notas_Academicas_DB/) | Notas Académicas | Desglose de rubros y registro de notas |
| [Ubicaciones_DB/](Ubicaciones_DB/) | Ubicaciones | Catálogo geográfico de Costa Rica |
| [Facturacion_DB/](Facturacion_DB/) | Facturación | Facturas y pagos |
| [Notificaciones_DB/](Notificaciones_DB/) | Notificaciones | Registro de notificaciones enviadas |

## Estructura de cada carpeta

```
Nombre_DB/
├── 01. Nombre_DB.sql              # Crea la base de datos, tablas y relaciones
├── 02. DatosIniciales.sql         # Datos iniciales (actualmente vacíos)
├── Diagrama Entidad Relacion/     # Diagrama ER de la base de datos
└── Procedimientos Almacenados/    # (solo en algunas carpetas)
```

## Cómo usar los scripts

1. Abre el archivo `01. *.sql` con **SQL Server Management Studio** (o cualquier herramienta compatible con SQL Server).
2. Confirma que estás conectado al servidor correcto.
3. Ejecuta el script.  
   - Crea la base de datos con el nombre indicado.
   - Requiere permisos para crear bases de datos.

Los archivos `02. DatosIniciales.sql` están preparados pero algunos se encuentran actualmente vacíos. Se pueden usar para cargar datos de prueba o catálogos.

## Diagrama entidad-relación

Cada carpeta incluye un diagrama ER en `Diagrama Entidad Relacion/`. Estos diagramas reflejan la estructura de tablas y relaciones de esa base de datos.

## Relación con el resto del proyecto

| Recurso | Ubicación |
|---------|-----------|
| Documentación general del proyecto | [../README.md](../README.md) |
| Detalle de microservicios | [../Backend/README.md](../Backend/README.md) |
| Diagramas de análisis y diseño | [../Documentacion/](../Documentacion/) |
| Diagramas de bases de datos (generales) | [../Documentacion/Diagramas Generales/Bases de Datos/](../Documentacion/Diagramas%20Generales/Bases%20de%20Datos/) |

---

Antes de ejecutar cualquier script, revise su contenido y verifique el servidor de destino.
