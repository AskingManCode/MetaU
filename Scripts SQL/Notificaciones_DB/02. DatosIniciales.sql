/* ============================================================
   DATOS INICIALES - Tablas EstadosNotificaciones y Plantillas
   Base de datos: Notificaciones_DB
   ============================================================ */

USE Notificaciones_DB;
GO

/* ------------------------------------------------------------
   ESTADOSNOTIFICACIONES
   ------------------------------------------------------------ */
INSERT INTO EstadosNotificaciones (EstadoNotificacionCode, Nombre, Estado)
VALUES 
('PENDIENTE', 'Pendiente de envío', 1),
('ENVIADO',   'Enviado correctamente', 1),
('ERROR',     'Error al enviar', 1),
('CANCELADO', 'Cancelado', 1);
GO

/* ------------------------------------------------------------
   PLANTILLAS
   ------------------------------------------------------------ */
INSERT INTO Plantillas (PlantillaNotificacionCode, Nombre, AsuntoTemplate, CuerpoTemplate, EsHTML, Estado)
VALUES 
(
    'CUSTOM',
    'Plantilla personalizada (cuerpo libre)',
    '{{Asunto}}',
    '{{Cuerpo}}',
    1,
    1
);
GO