/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Notificaciones_ActualizarEstado
   Descripción: Actualiza el estado de una notificación existente
                (ENVIADO / ERROR) e incrementa el contador de intentos
   Base de datos: tiusr20pl_Notificaciones_DB
   ============================================================ */

USE tiusr20pl_Notificaciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Notificaciones_ActualizarEstado
    @NotificacionID BIGINT,
    @EstadoNotificacion VARCHAR(15),
    @MensajeError VARCHAR(500) = NULL,
    @FechaEnvio DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        -- Validaciones básicas
        IF @NotificacionID IS NULL OR @NotificacionID <= 0
        BEGIN
            RAISERROR('El NotificacionID es obligatorio.', 16, 1);
            RETURN;
        END

        IF @EstadoNotificacion IS NULL OR LEN(TRIM(@EstadoNotificacion)) = 0
        BEGIN
            RAISERROR('El estado de la notificación es obligatorio.', 16, 1);
            RETURN;
        END

        -- Verificar existencia
        IF NOT EXISTS (
            SELECT 1
            FROM MetaU_DB_User.Notificaciones
            WHERE NotificacionID = @NotificacionID
        )
        BEGIN
            RETURN;
        END

        -- Verificar que exista el estado
        IF NOT EXISTS (
            SELECT 1
            FROM MetaU_DB_User.EstadosNotificaciones
            WHERE EstadoNotificacionCode = @EstadoNotificacion
              AND Estado = 1
        )
        BEGIN
            RAISERROR('El estado ''%s'' no existe o está inactivo.', 16, 1, @EstadoNotificacion);
            RETURN;
        END

        UPDATE MetaU_DB_User.Notificaciones
        SET
            EstadoNotificacion = UPPER(@EstadoNotificacion),
            MensajeError = @MensajeError,
            FechaEnvio = @FechaEnvio,
            NumeroIntentos = NumeroIntentos + 1,
            FechaUltimoIntento = SYSDATETIME()
        OUTPUT
            INSERTED.NotificacionID,
            INSERTED.UsuarioID,
            INSERTED.EmailDestino,
            INSERTED.PlantillaNotificacionCode,
            INSERTED.ParametrosJson,
            INSERTED.FechaCreacion,
            INSERTED.FechaEnvio,
            INSERTED.EstadoNotificacion,
            INSERTED.MensajeError,
            INSERTED.NumeroIntentos,
            INSERTED.FechaUltimoIntento
        WHERE NotificacionID = @NotificacionID;

    END TRY
    BEGIN CATCH
        DECLARE
            @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrorSeverity INT = ERROR_SEVERITY(),
            @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO