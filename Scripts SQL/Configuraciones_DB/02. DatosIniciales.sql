/* ============================================================
   DATOS INICIALES - Tabla Parametros
   Base de datos: Configuraciones_DB
   ============================================================ */

USE Configuraciones_DB;
GO

INSERT INTO dbo.Parametros (ParametroCode, Valor)
VALUES
    ('DOMEST', 'cuc.cr'),
    ('DOMPROF', 'cuc.ac.cr'),
    ('DOMADM', 'cuc.ac.cr'),
    ('JWTEXP', '5'),
    ('REFEXP', '60'),
    ('COSTOCUR', '30000'),
    ('IMPPCT', '2'),
    ('CUPOMAX', '30'),
    ('DETFAC', 'Servicios estudiantiles'),
    ('PAGSIZE', '10'),
    ('SYSNAME', 'MetaU');
GO