/* ============================================================
   DATOS INICIALES - Tabla EstadosFacturas, EstadosPagos
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

/* ------------------------------------------------------------
   ESTADOSFACTURAS
   ------------------------------------------------------------ */
MERGE dbo.EstadosFacturas AS destino
USING (VALUES
    ('PEND', 'Pendiente de Cobro'),
    ('PAG', 'Pagada'),
    ('ANU', 'Anulada')
) AS origen (EstadoFacturaCode, Nombre)
ON destino.EstadoFacturaCode = origen.EstadoFacturaCode
WHEN MATCHED THEN
    UPDATE SET Nombre = origen.Nombre, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (EstadoFacturaCode, Nombre) VALUES (origen.EstadoFacturaCode, origen.Nombre);
GO

/* ------------------------------------------------------------
   ESTADOSPAGOS
   ------------------------------------------------------------ */
MERGE dbo.EstadosPagos AS destino
USING (VALUES
    ('ACT', 'Activo'),
    ('REV', 'Reversado')
) AS origen (EstadoPagoCode, Nombre)
ON destino.EstadoPagoCode = origen.EstadoPagoCode
WHEN MATCHED THEN
    UPDATE SET Nombre = origen.Nombre, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (EstadoPagoCode, Nombre) VALUES (origen.EstadoPagoCode, origen.Nombre);
GO