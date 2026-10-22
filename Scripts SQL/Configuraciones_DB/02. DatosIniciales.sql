/* ============================================================
   DATOS INICIALES - Tabla MetaU_DB_User.Parametros
   Base de datos: tiusr20pl_Configuraciones_DB;
   ============================================================ */

USE tiusr20pl_Configuraciones_DB;
GO

INSERT INTO MetaU_DB_User.Parametros (ParametroCode, Valor)
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
    ('PAGSIZE', '15'),
    ('SYSNAME', 'MetaU');
GO