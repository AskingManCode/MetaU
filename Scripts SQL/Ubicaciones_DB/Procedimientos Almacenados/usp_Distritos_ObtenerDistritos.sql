/* ============================================================
   STORE PROCEDURE: MetaU_DB_User.usp_Distritos_ObtenerDistritos
   Descripción: Lista los distritos activos de un cantón (validando provincia)
   Base de Datos: tiusr20pl_Ubicaciones_DB
   ============================================================ */

USE tiusr20pl_Ubicaciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Distritos_ObtenerDistritos
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
    IF NOT EXISTS (SELECT 1 FROM MetaU_DB_User.Provincias WHERE ProvinciaID = @ProvinciaID AND Estado = 1)
    BEGIN
        RAISERROR('No se encontró la provincia especificada.', 16, 1);
        RETURN;
    END

    -- Validar que el cantón exista y esté activo
    IF NOT EXISTS (
        SELECT 1 
        FROM MetaU_DB_User.Cantones 
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
    FROM MetaU_DB_User.Distritos
    WHERE ProvinciaID = @ProvinciaID
      AND CantonID = @CantonID
      AND Estado = 1
    ORDER BY Nombre;
END
GO