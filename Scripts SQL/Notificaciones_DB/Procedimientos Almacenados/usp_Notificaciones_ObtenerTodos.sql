/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Notificaciones_ObtenerTodos
   Descripción: Consulta el historial de notificaciones enviadas
   Base de datos: tiusr20pl_Notificaciones_DB
   ============================================================ */

USE tiusr20pl_Notificaciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Notificaciones_ObtenerTodos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        n.NotificacionID,
        n.UsuarioID,
        n.EmailDestino,
        n.PlantillaNotificacionCode,
        n.ParametrosJson,
        JSON_VALUE(n.ParametrosJson, '$.Asunto') AS Asunto,
        JSON_VALUE(n.ParametrosJson, '$.Cuerpo') AS Cuerpo,
        n.FechaCreacion,
        n.FechaEnvio,
        n.EstadoNotificacion,
        e.Nombre AS EstadoNombre,
        n.MensajeError,
        n.NumeroIntentos,
        n.FechaUltimoIntento
    FROM MetaU_DB_User.Notificaciones AS n
    LEFT JOIN MetaU_DB_User.EstadosNotificaciones AS e 
        ON e.EstadoNotificacionCode = n.EstadoNotificacion
    ORDER BY n.FechaCreacion DESC;
END
GO
