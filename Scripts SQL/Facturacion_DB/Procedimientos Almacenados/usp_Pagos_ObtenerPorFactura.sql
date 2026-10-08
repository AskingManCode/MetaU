/* ============================================================
   STORED PROCEDURE: usp_Pagos_ObtenerPorFactura
   Descripción: Lista los pagos asociados a una factura.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Pagos_ObtenerPorFactura
    @FacturaID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @FacturaID IS NULL
    BEGIN
        RAISERROR('El identificador de la factura es obligatorio.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Facturas WHERE FacturaID = @FacturaID)
    BEGIN
        RAISERROR('No existe la factura indicada.', 16, 1);
        RETURN;
    END

    SELECT pago.PagoID, pago.FacturaID, pago.Monto, pago.FechaPago, pago.FechaReversion,
           estado.Nombre AS Estado
    FROM dbo.Pagos AS pago
    INNER JOIN dbo.EstadosPagos AS estado ON estado.EstadoPagoCode = pago.EstadoPagoCode
    WHERE pago.FacturaID = @FacturaID
    ORDER BY pago.FechaPago, pago.PagoID;
END
GO
