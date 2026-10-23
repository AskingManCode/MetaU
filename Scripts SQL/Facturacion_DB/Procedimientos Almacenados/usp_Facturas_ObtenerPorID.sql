/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Facturas_ObtenerPorID
   Descripción: Obtiene encabezado + detalle(s) de una factura
   Base de datos: tiusr20pl_Facturacion_DB
   ============================================================ */

USE tiusr20pl_Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Facturas_ObtenerPorID
    @FacturaID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF @FacturaID IS NULL
    BEGIN
        RAISERROR('El identificador de la factura es obligatorio.', 16, 1);
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
    WHERE f.FacturaID = @FacturaID
    ORDER BY d.DetalleFacturaID;
END
GO