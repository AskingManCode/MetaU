/* ============================================================
   DATOS INICIALES - Tabla Parametros
   Base de datos: Configuraciones_DB
   ============================================================ */

USE Configuraciones_DB;
GO

INSERT INTO dbo.Parametros (ParametroCode, Valor, Estado)
VALUES
    ('DOMEST', 'cuc.cr', 1),
    ('DOMPROF', 'cuc.ac.cr', 1),
    ('DOMADM', 'cuc.ac.cr', 1),
    ('JWTEXP', '5', 1),
    ('REFEXP', '60', 1),
    ('COSTOCUR', '30000', 1),
    ('IMPPCT', '2', 1),
    ('CUPOMAX', '30', 1),
    ('DETFAC', 'Servicios estudiantiles', 1),
    ('PAGSIZE', '10', 1),
    ('SYSNAME', 'MetaU', 1);
GO