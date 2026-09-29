# Scripts SQL de MetaU

En esta carpeta están los scripts de SQL Server y los diagramas entidad-relación de las bases de datos del proyecto. Cada base de datos tiene su propia carpeta:

| Carpeta | Base de datos |
| --- | --- |
| [Configuraciones_DB](Configuraciones_DB/) | Configuraciones |
| [Facturacion_DB](Facturacion_DB/) | Facturación |
| [Logs_DB](Logs_DB/) | Bitácoras y logs |
| [Matriculas_DB](Matriculas_DB/) | Matrículas |
| [Notas_Academicas_DB](Notas_Academicas_DB/) | Notas académicas |
| [Notificaciones_DB](Notificaciones_DB/) | Notificaciones |
| [Oferta_Academica_DB](Oferta_Academica_DB/) | Oferta académica |
| [Ubicaciones_DB](Ubicaciones_DB/) | Ubicaciones |
| [Usuarios_DB](Usuarios_DB/) | Usuarios y roles |

## Cómo usar los scripts

Los archivos `01. *.sql` crean la base de datos y sus tablas y relaciones. Se pueden abrir y ejecutar con SQL Server Management Studio u otra herramienta compatible con SQL Server.

Antes de ejecutarlos, revisa el contenido y confirma que estás conectado al servidor correcto. Los scripts crean bases de datos con los nombres indicados, por lo que puede hacer falta permiso para crearlas.

Los archivos `02. DatosIniciales.sql` están preparados en las carpetas, pero actualmente están vacíos; todavía no hay datos iniciales para cargar.

Cada carpeta también incluye un diagrama entidad-relación en `Diagrama Entidad Relacion/`. La organización y los detalles de los microservicios se pueden consultar en el [README del Backend](../Backend/README.md).
