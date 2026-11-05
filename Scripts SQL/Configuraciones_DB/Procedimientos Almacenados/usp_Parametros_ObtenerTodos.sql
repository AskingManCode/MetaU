/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Parametros_ObtenerTodos
   Descripción: Consulta todos los parámetros de la tabla Parametros
   Base de datos: tiusr20pl_Configuraciones_DB
   ============================================================ */

USE tiusr20pl_Configuraciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Parametros_ObtenerTodos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ParametroCode,
        Valor,
        Estado
    FROM MetaU_DB_User.Parametros
    ORDER BY ParametroCode;
END
GO