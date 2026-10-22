/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Parametros_ObtenerPorID
   Descripción: Consulta un parámetro existente en la tabla Parametros
   Base de datos: tiusr20pl_Configuraciones_DB
   ============================================================ */

USE tiusr20pl_Configuraciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Parametros_ObtenerPorID
    @ParametroCode VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ParametroCode,
        Valor,
        Estado
    FROM MetaU_DB_User.Parametros
    WHERE ParametroCode = UPPER(@ParametroCode)
END
GO