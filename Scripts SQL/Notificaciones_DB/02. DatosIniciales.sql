/* ============================================================
   DATOS INICIALES - Tablas EstadosNotificaciones y Plantillas
   Base de datos: tiusr20pl_Notificaciones_DB
   ============================================================ */

USE tiusr20pl_Notificaciones_DB;
GO

/* ------------------------------------------------------------
   ESTADOSNOTIFICACIONES
   ------------------------------------------------------------ */
MERGE MetaU_DB_User.EstadosNotificaciones AS destino
USING (VALUES
    ('PENDIENTE', 'Pendiente de envío'),
    ('ENVIADO', 'Enviado correctamente'),
    ('ERROR', 'Error al enviar'),
    ('CANCELADO', 'Cancelado')
) AS origen (EstadoNotificacionCode, Nombre)
ON destino.EstadoNotificacionCode = origen.EstadoNotificacionCode
WHEN MATCHED THEN
    UPDATE SET Nombre = origen.Nombre, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (EstadoNotificacionCode, Nombre) VALUES (origen.EstadoNotificacionCode, origen.Nombre);
GO

/* ------------------------------------------------------------
   PLANTILLAS
   ------------------------------------------------------------ */
MERGE MetaU_DB_User.Plantillas AS destino
USING (VALUES
    ('CUSTOM', 'Plantilla personalizada (cuerpo libre)', '{{Asunto}}', '{{Cuerpo}}', 1)
) AS origen (PlantillaNotificacionCode, Nombre, AsuntoTemplate, CuerpoTemplate, EsHTML)
ON destino.PlantillaNotificacionCode = origen.PlantillaNotificacionCode
WHEN MATCHED THEN
    UPDATE SET Nombre = origen.Nombre, AsuntoTemplate = origen.AsuntoTemplate, 
               CuerpoTemplate = origen.CuerpoTemplate, EsHTML = origen.EsHTML, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (PlantillaNotificacionCode, Nombre, AsuntoTemplate, CuerpoTemplate, EsHTML) 
    VALUES (origen.PlantillaNotificacionCode, origen.Nombre, origen.AsuntoTemplate, origen.CuerpoTemplate, origen.EsHTML);
GO