/* ============================================================
   STORE PROCEDURE: usp_Cantones_ObtenerCantones
   Descripción: Lista los cantones activos de una provincia
   Base de Datos: Ubicaciones_DB
   ============================================================ */

USE Ubicaciones_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Cantones_ObtenerCantones
    @ProvinciaID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @ProvinciaID IS NULL
    BEGIN
        RAISERROR('El identificador de la provincia es obligatorio.', 16, 1);
        RETURN;
    END

    -- Validar que la provincia exista y esté activa
    IF NOT EXISTS (SELECT 1 FROM dbo.Provincias WHERE ProvinciaID = @ProvinciaID AND Estado = 1)
    BEGIN
        RAISERROR('No se encontró la provincia especificada.', 16, 1);
        RETURN;
    END

    SELECT 
        CantonID,
        ProvinciaID,
        Nombre,
        Estado
    FROM dbo.Cantones
    WHERE ProvinciaID = @ProvinciaID
      AND Estado = 1
    ORDER BY Nombre;
END
GO