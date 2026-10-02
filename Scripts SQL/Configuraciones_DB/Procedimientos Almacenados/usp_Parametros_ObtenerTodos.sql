/* ============================================================
   STORED PROCEDURE: usp_Parametros_ObtenerTodos
   Descripción: Consulta todos los parámetros de la tabla Parametros
   Base de datos: Configuraciones_DB
   ============================================================ */

USE Configuraciones_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Parametros_ObtenerTodos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ParametroCode,
        Valor,
        Estado
    FROM dbo.Parametros
    ORDER BY ParametroCode;
END
GO