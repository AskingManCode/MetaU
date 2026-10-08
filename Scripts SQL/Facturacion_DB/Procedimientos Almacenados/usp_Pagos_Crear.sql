/* ============================================================
   STORED PROCEDURE: usp_Pagos_Crear
   Descripción: Registra el pago del saldo total pendiente de una factura.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Pagos_Crear
    @FacturaID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @TotalFactura DECIMAL(12,2);
    DECLARE @EstadoFactura VARCHAR(15);
    DECLARE @MontoPagado DECIMAL(12,2);
    DECLARE @MontoPago DECIMAL(12,2);
    DECLARE @PagoID UNIQUEIDENTIFIER;

    BEGIN TRY
        IF @FacturaID IS NULL
        BEGIN
            RAISERROR('El identificador de la factura es obligatorio.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.EstadosPagos
            WHERE EstadoPagoCode = 'ACT'
              AND Estado = 1
        )
        BEGIN
            RAISERROR('No existe un estado activo para registrar pagos.', 16, 1);
            RETURN;
        END

        BEGIN TRANSACTION;

        SELECT
            @TotalFactura = factura.Total,
            @EstadoFactura = factura.EstadoFacturaCode
        FROM dbo.Facturas AS factura WITH (UPDLOCK, HOLDLOCK)
        WHERE factura.FacturaID = @FacturaID;

        IF @TotalFactura IS NULL
        BEGIN
            RAISERROR('No existe la factura indicada.', 16, 1);
            RETURN;
        END

        IF @EstadoFactura = 'ANU'
        BEGIN
            RAISERROR('No se puede pagar una factura anulada.', 16, 1);
            RETURN;
        END

        IF @EstadoFactura = 'PAG'
        BEGIN
            RAISERROR('La factura ya está pagada.', 16, 1);
            RETURN;
        END

        IF @EstadoFactura <> 'PEND'
        BEGIN
            RAISERROR('La factura no está pendiente de pago.', 16, 1);
            RETURN;
        END

        SELECT @MontoPagado = ISNULL(SUM(Monto), 0)
        FROM dbo.Pagos WITH (UPDLOCK, HOLDLOCK)
        WHERE FacturaID = @FacturaID
          AND EstadoPagoCode = 'ACT';

        SET @MontoPago = @TotalFactura - @MontoPagado;
        IF @MontoPago <= 0
        BEGIN
            RAISERROR('La factura no tiene saldo pendiente de pago.', 16, 1);
            RETURN;
        END

        DECLARE @PagoCreado TABLE (PagoID UNIQUEIDENTIFIER);

        INSERT INTO dbo.Pagos (FacturaID, Monto, EstadoPagoCode)
        OUTPUT INSERTED.PagoID INTO @PagoCreado
        VALUES (@FacturaID, @MontoPago, 'ACT');

        SELECT @PagoID = PagoID FROM @PagoCreado;

        UPDATE dbo.Facturas
        SET EstadoFacturaCode = 'PAG'
        WHERE FacturaID = @FacturaID
          AND EstadoFacturaCode = 'PEND';

        IF @@ROWCOUNT <> 1
            RAISERROR('La factura no está pendiente de pago.', 16, 1);

        COMMIT TRANSACTION;

        SELECT @PagoID AS PagoID;
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
