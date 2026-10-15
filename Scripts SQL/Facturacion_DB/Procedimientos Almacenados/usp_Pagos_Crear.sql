/* ============================================================
   STORED PROCEDURE: usp_Pagos_Crear
   Descripción: Registra el pago del saldo total pendiente de una factura
                y marca la factura como PAGADA.
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
            THROW 50001, 'El identificador de la factura es obligatorio.', 1;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.EstadosPagos
            WHERE EstadoPagoCode = 'ACT'
              AND Estado = 1
        )
            THROW 50002, 'No existe un estado activo para registrar pagos.', 1;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.EstadosFacturas
            WHERE EstadoFacturaCode = 'PAG'
              AND Estado = 1
        )
            THROW 50003, 'No existe un estado activo ''PAG'' para facturas.', 1;

        BEGIN TRANSACTION;

        SELECT
            @TotalFactura = factura.Total,
            @EstadoFactura = factura.EstadoFacturaCode
        FROM dbo.Facturas AS factura WITH (UPDLOCK, HOLDLOCK)
        WHERE factura.FacturaID = @FacturaID;

        IF @TotalFactura IS NULL
            THROW 50004, 'No existe la factura indicada.', 1;

        IF @EstadoFactura = 'ANU' OR @EstadoFactura = 'ANUL'
            THROW 50005, 'No se puede pagar una factura anulada.', 1;

        IF @EstadoFactura = 'PAG'
            THROW 50006, 'La factura ya está pagada.', 1;

        IF @EstadoFactura <> 'PEND'
            THROW 50007, 'La factura no está pendiente de pago.', 1;

        SELECT @MontoPagado = ISNULL(SUM(Monto), 0)
        FROM dbo.Pagos WITH (UPDLOCK, HOLDLOCK)
        WHERE FacturaID = @FacturaID
          AND EstadoPagoCode = 'ACT';

        SET @MontoPago = @TotalFactura - @MontoPagado;

        IF @MontoPago <= 0
            THROW 50008, 'La factura no tiene saldo pendiente de pago.', 1;

        DECLARE @PagoCreado TABLE (PagoID UNIQUEIDENTIFIER);

        INSERT INTO dbo.Pagos (FacturaID, Monto, EstadoPagoCode)
        OUTPUT INSERTED.PagoID INTO @PagoCreado
        VALUES (@FacturaID, @MontoPago, 'ACT');

        SELECT @PagoID = PagoID FROM @PagoCreado;

        -- Marcar la factura como pagada
        UPDATE dbo.Facturas
        SET EstadoFacturaCode = 'PAG'
        WHERE FacturaID = @FacturaID
          AND EstadoFacturaCode = 'PEND';

        IF @@ROWCOUNT <> 1
            THROW 50009, 'No se pudo actualizar el estado de la factura a pagada.', 1;

        COMMIT TRANSACTION;

        SELECT @PagoID AS PagoID;

    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END
GO
