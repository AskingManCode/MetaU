/* ============================================================
   DATOS INICIALES - Tabla EstadosFacturas, EstadosPagos
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

/* ------------------------------------------------------------
   ESTADOSFACTURAS
   ------------------------------------------------------------ */
INSERT INTO EstadosFacturas (EstadoFacturaCode, Nombre) VALUES
('PEND', 'Pendiente de Cobro'),
('PAG', 'Pagada'),
('ANU', 'Anulada');
GO

/* ------------------------------------------------------------
   ESTADOSPAGOS
   ------------------------------------------------------------ */
INSERT INTO EstadosPagos (EstadoPagoCode, Nombre) VALUES
('ACT', 'Activo'),
('REV', 'Reversado');
GO