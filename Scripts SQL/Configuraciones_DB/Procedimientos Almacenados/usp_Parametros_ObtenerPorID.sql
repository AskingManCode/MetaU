/* ============================================================
   STORED PROCEDURE: usp_Parametros_ObtenerPorID
   Descripción: Consulta un parámetro existente en la tabla Parametros
   Base de datos: Configuraciones_DB
   ============================================================ */

USE Configuraciones_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Parametros_ObtenerPorID
    @ParametroCode VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ParametroCode,
        Valor,
        Estado
    FROM dbo.Parametros
    WHERE ParametroCode = UPPER(@ParametroCode)
END
GO