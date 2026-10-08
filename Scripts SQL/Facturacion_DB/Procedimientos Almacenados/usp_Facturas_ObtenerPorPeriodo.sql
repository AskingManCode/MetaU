/* ============================================================
   STORED PROCEDURE: usp_Facturas_ObtenerPorPeriodo
   Descripción: Lista encabezados y detalles de las facturas de un periodo.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Facturas_ObtenerPorPeriodo
    @PeriodoID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @PeriodoID IS NULL
    BEGIN
        RAISERROR('El identificador del periodo es obligatorio.', 16, 1);
        RETURN;
    END

    SELECT f.FacturaID, f.EstudianteID, f.MatriculaID, f.PeriodoID,
           e.Nombre AS Estado, f.FechaEmision, f.FechaAnulacion,
           f.Subtotal, f.PorcentajeImpuesto, f.Impuesto, f.Total,
           d.DetalleFacturaID, d.Descripcion, d.CursoCode, d.Monto AS MontoDetalle
    FROM dbo.Facturas AS f
    INNER JOIN dbo.EstadosFacturas AS e ON e.EstadoFacturaCode = f.EstadoFacturaCode
    LEFT JOIN dbo.DetallesFacturas AS d ON d.FacturaID = f.FacturaID
    WHERE f.PeriodoID = @PeriodoID
    ORDER BY f.FechaEmision, f.FacturaID, d.DetalleFacturaID;
END
GO
