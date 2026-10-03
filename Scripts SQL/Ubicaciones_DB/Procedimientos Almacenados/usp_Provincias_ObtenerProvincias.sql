/* ============================================================
   STORE PROCEDURE: usp_Provincias_ObtenerProvincias
   Descripción: Lista todas las provincias activas
   Base de Datos: Ubicaciones_DB
   ============================================================ */

USE Ubicaciones_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Provincias_ObtenerProvincias
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ProvinciaID,
        Nombre,
        Estado
    FROM dbo.Provincias
    WHERE Estado = 1
    ORDER BY Nombre;
END
GO