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

	IF @CantonID IS NULL
	BEGIN
		RAISERROR('El identificador del cantón es obligatorio.', 16, 1);
		RETURN;
	END

	SELECT
		ProvinciaID,
		CantonID,
		DistritoID,
		Nombre,
		Estado
	FROM dbo.Distritos
	WHERE ProvinciaID = @ProvinciaID
		AND CantonID = @CantonID
		AND Estado = 1
	ORDER BY Nombre;
END;
GO