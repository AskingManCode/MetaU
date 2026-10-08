/* ============================================================
   STORED PROCEDURE: usp_Pagos_ObtenerPorID
   Descripción: Obtiene un pago por su identificador.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Pagos_ObtenerPorID
    @PagoID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @PagoID IS NULL
    BEGIN
        RAISERROR('El identificador del pago es obligatorio.', 16, 1);
        RETURN;
    END

    SELECT pago.PagoID, pago.FacturaID, pago.Monto, pago.FechaPago, pago.FechaReversion,
           estado.Nombre AS Estado
    FROM dbo.Pagos AS pago
    INNER JOIN dbo.EstadosPagos AS estado ON estado.EstadoPagoCode = pago.EstadoPagoCode
    WHERE pago.PagoID = @PagoID;
END
GO
