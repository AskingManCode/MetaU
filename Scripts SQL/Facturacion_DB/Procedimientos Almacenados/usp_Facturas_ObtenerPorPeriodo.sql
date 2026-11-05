/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Facturas_ObtenerPorPeriodo
   Descripción: Lista las facturas (encabezado + detalle) de un periodo
   Base de datos: tiusr20pl_Facturacion_DB
   ============================================================ */

USE tiusr20pl_Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Facturas_ObtenerPorPeriodo
    @PeriodoID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @PeriodoID IS NULL
    BEGIN
        RAISERROR('El identificador del periodo es obligatorio.', 16, 1);
        RETURN;
    END

    SELECT 
        f.FacturaID,
        f.IdentificacionEstudiante,
        f.MatriculaID,
        f.PeriodoID,
        e.Nombre AS Estado,
        f.FechaEmision,
        f.FechaAnulacion,
        f.Subtotal,
        f.PorcentajeImpuesto,
        f.Impuesto,
        f.Total,
        d.DetalleFacturaID,
        d.Descripcion,
        d.CursoCode,
        d.Monto AS MontoDetalle
    FROM MetaU_DB_User.Facturas AS f
    INNER JOIN MetaU_DB_User.EstadosFacturas AS e ON e.EstadoFacturaCode = f.EstadoFacturaCode
    LEFT JOIN MetaU_DB_User.DetallesFacturas AS d ON d.FacturaID = f.FacturaID
    WHERE f.PeriodoID = @PeriodoID
    ORDER BY f.FechaEmision, f.FacturaID, d.DetalleFacturaID;
END
GO