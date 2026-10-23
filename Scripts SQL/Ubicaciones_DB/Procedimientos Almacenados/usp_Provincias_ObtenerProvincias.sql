/* ============================================================
   STORE PROCEDURE: usp_Provincias_ObtenerProvincias
   Descripción: Lista todas las provincias activas
   Base de Datos: tiusr20pl_Ubicaciones_DB
   ============================================================ */

USE tiusr20pl_Ubicaciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Provincias_ObtenerProvincias
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ProvinciaID,
        Nombre,
        Estado
    FROM MetaU_DB_User.Provincias
    WHERE Estado = 1
    ORDER BY Nombre;
END
GO