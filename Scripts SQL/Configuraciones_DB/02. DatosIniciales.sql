/* ============================================================
   DATOS INICIALES - Tabla MetaU_DB_User.Parametros
   Base de datos: tiusr20pl_Configuraciones_DB
   ============================================================ */

USE tiusr20pl_Configuraciones_DB;
GO

MERGE MetaU_DB_User.Parametros AS destino
USING (VALUES
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
    ('SYSNAME', 'MetaU')
) AS origen (ParametroCode, Valor)
ON destino.ParametroCode = origen.ParametroCode
WHEN MATCHED THEN
    UPDATE SET Valor = origen.Valor, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (ParametroCode, Valor) VALUES (origen.ParametroCode, origen.Valor);
GO