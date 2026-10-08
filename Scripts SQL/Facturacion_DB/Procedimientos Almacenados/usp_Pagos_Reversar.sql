/* ============================================================
   STORED PROCEDURE: usp_Pagos_Reversar
   Descripción: Reversa un pago y actualiza el estado de su factura.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Pagos_Reversar
    @PagoID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @FacturaID UNIQUEIDENTIFIER;
    DECLARE @EstadoPago VARCHAR(15);

    BEGIN TRY
        IF @PagoID IS NULL
        BEGIN
            RAISERROR('El identificador del pago es obligatorio.', 16, 1);
            RETURN;
        END

        SELECT
            @FacturaID = FacturaID
        FROM dbo.Pagos
        WHERE PagoID = @PagoID;

        IF @FacturaID IS NULL
            RETURN;

        BEGIN TRANSACTION;

        SELECT @FacturaID = FacturaID
        FROM dbo.Facturas WITH (UPDLOCK, HOLDLOCK)
        WHERE FacturaID = @FacturaID;

        SELECT @EstadoPago = EstadoPagoCode
        FROM dbo.Pagos WITH (UPDLOCK, HOLDLOCK)
        WHERE PagoID = @PagoID
          AND FacturaID = @FacturaID;

        IF @EstadoPago IS NULL OR @EstadoPago = 'REV'
        BEGIN
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE dbo.Pagos
        SET EstadoPagoCode = 'REV',
            FechaReversion = SYSDATETIME()
        WHERE PagoID = @PagoID
          AND EstadoPagoCode = 'ACT';

        UPDATE dbo.Facturas
        SET EstadoFacturaCode = 'PEND'
        WHERE FacturaID = @FacturaID
          AND EstadoFacturaCode <> 'ANU';

        COMMIT TRANSACTION;

        SELECT pago.PagoID, pago.FacturaID, pago.Monto, pago.FechaPago, pago.FechaReversion,
               estado.Nombre AS Estado
        FROM dbo.Pagos AS pago
        INNER JOIN dbo.EstadosPagos AS estado ON estado.EstadoPagoCode = pago.EstadoPagoCode
        WHERE pago.PagoID = @PagoID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        DECLARE
            @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrorSeverity INT = ERROR_SEVERITY(),
            @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
