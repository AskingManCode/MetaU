/* ============================================================
   STORE PROCEDURE: usp_Distritos_ObtenerDistritos
   Descripción: Lista los distritos activos de un cantón (validando provincia)
   Base de Datos: Ubicaciones_DB
   ============================================================ */

USE Ubicaciones_DB;
GO

CREATE OR ALTER PROCEDURE usp_Distritos_ObtenerDistritos
	@ProvinciaID UNIQUEIDENTIFIER,
	@CantonID UNIQUEIDENTIFIER
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

    -- Validar que el cantón exista y esté activo
    IF NOT EXISTS (
        SELECT 1 
        FROM dbo.Cantones 
        WHERE CantonID = @CantonID 
          AND ProvinciaID = @ProvinciaID 
          AND Estado = 1
    )
    BEGIN
        RAISERROR('No se encontró el cantón especificado para esa provincia.', 16, 1);
        RETURN;
    END

    SELECT 
        DistritoID,
        CantonID,
        ProvinciaID,
        Nombre,
        Estado
    FROM dbo.Distritos
    WHERE ProvinciaID = @ProvinciaID
      AND CantonID = @CantonID
      AND Estado = 1
    ORDER BY Nombre;
END
GO