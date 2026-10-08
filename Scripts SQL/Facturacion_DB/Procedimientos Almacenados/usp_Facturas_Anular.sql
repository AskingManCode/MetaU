/* ============================================================
   STORED PROCEDURE: usp_Facturas_Anular
   Descripción: Anula una factura existente.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Facturas_Anular
    @FacturaID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @FacturaID IS NULL
        BEGIN
            RAISERROR('El identificador de la factura es obligatorio.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Facturas
            WHERE FacturaID = @FacturaID
        )
        BEGIN
            SELECT CAST(0 AS BIT) AS Anulada;
            RETURN;
        END

        UPDATE dbo.Facturas
        SET EstadoFacturaCode = 'ANU',
            FechaAnulacion = SYSDATETIME()
        WHERE FacturaID = @FacturaID
          AND EstadoFacturaCode <> 'ANU';

        SELECT CAST(IIF(@@ROWCOUNT = 1, 1, 0) AS BIT) AS Anulada;
    END TRY
    BEGIN CATCH
        DECLARE
            @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrorSeverity INT = ERROR_SEVERITY(),
            @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
