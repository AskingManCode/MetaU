/* ============================================================
   STORED PROCEDURE: usp_Facturas_ObtenerPorID
   Descripción: Obtiene el encabezado y detalle de una factura.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Facturas_ObtenerPorID
    @FacturaID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @FacturaID IS NULL
    BEGIN
        RAISERROR('El identificador de la factura es obligatorio.', 16, 1);
        RETURN;
    END

    SELECT f.FacturaID, f.EstudianteID, f.MatriculaID, f.PeriodoID,
           e.Nombre AS Estado, f.FechaEmision, f.FechaAnulacion,
           f.Subtotal, f.PorcentajeImpuesto, f.Impuesto, f.Total,
           d.DetalleFacturaID, d.Descripcion, d.CursoCode, d.Monto AS MontoDetalle
    FROM dbo.Facturas AS f
    INNER JOIN dbo.EstadosFacturas AS e ON e.EstadoFacturaCode = f.EstadoFacturaCode
    LEFT JOIN dbo.DetallesFacturas AS d ON d.FacturaID = f.FacturaID
    WHERE f.FacturaID = @FacturaID;
END
GO
