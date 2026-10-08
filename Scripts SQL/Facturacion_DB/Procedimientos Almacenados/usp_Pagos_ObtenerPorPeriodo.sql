/* ============================================================
   STORED PROCEDURE: usp_Pagos_ObtenerPorPeriodo
   Descripción: Lista los pagos de las facturas de un periodo.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Pagos_ObtenerPorPeriodo
    @PeriodoID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @PeriodoID IS NULL
    BEGIN
        RAISERROR('El identificador del periodo es obligatorio.', 16, 1);
        RETURN;
    END

    SELECT pago.PagoID, pago.FacturaID, pago.Monto, pago.FechaPago, pago.FechaReversion,
           estado.Nombre AS Estado
    FROM dbo.Pagos AS pago
    INNER JOIN dbo.EstadosPagos AS estado ON estado.EstadoPagoCode = pago.EstadoPagoCode
    INNER JOIN dbo.Facturas AS factura ON factura.FacturaID = pago.FacturaID
    WHERE factura.PeriodoID = @PeriodoID
    ORDER BY pago.FechaPago, pago.PagoID;
END
GO
