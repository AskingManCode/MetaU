/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Notificaciones_Crear
   Descripción: Inserta una nueva notificación con estado PENDIENTE
   Base de datos: tiusr20pl_Notificaciones_DB
   ============================================================ */

USE tiusr20pl_Notificaciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Notificaciones_Crear
    @UsuarioID UNIQUEIDENTIFIER,
    @EmailDestino VARCHAR(150),
    @PlantillaNotificacionCode VARCHAR(50) = 'CUSTOM',
    @ParametrosJson VARCHAR(MAX) = NULL,
    @EstadoNotificacion VARCHAR(15) = 'PENDIENTE'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        -- Validaciones básicas
        IF @UsuarioID IS NULL
        BEGIN
            RAISERROR('El UsuarioID es obligatorio.', 16, 1);
            RETURN;
        END

        IF @EmailDestino IS NULL OR LEN(TRIM(@EmailDestino)) = 0
        BEGIN
            RAISERROR('El correo de destino es obligatorio.', 16, 1);
            RETURN;
        END

        IF @PlantillaNotificacionCode IS NULL OR LEN(TRIM(@PlantillaNotificacionCode)) = 0
        BEGIN
            RAISERROR('El código de plantilla es obligatorio.', 16, 1);
            RETURN;
        END

        IF @EstadoNotificacion IS NULL OR LEN(TRIM(@EstadoNotificacion)) = 0
        BEGIN
            RAISERROR('El estado de la notificación es obligatorio.', 16, 1);
            RETURN;
        END

        -- Verificar que exista la plantilla
        IF NOT EXISTS (
            SELECT 1
            FROM MetaU_DB_User.Plantillas
            WHERE PlantillaNotificacionCode = @PlantillaNotificacionCode
              AND Estado = 1
        )
        BEGIN
            RAISERROR('La plantilla ''%s'' no existe o está inactiva.', 16, 1, @PlantillaNotificacionCode);
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

        INSERT INTO MetaU_DB_User.Notificaciones (
            UsuarioID,
            EmailDestino,
            PlantillaNotificacionCode,
            ParametrosJson,
            EstadoNotificacion,
            NumeroIntentos
        )
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
        VALUES (
            @UsuarioID,
            TRIM(@EmailDestino),
            UPPER(@PlantillaNotificacionCode),
            @ParametrosJson,
            UPPER(@EstadoNotificacion),
            0
        );

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