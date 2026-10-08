/* ============================================================
   STORED PROCEDURE: usp_Notificaciones_Crear
   Descripción: Inserta una nueva notificación con estado PENDIENTE
   Base de datos: Notificaciones_DB
   ============================================================ */

USE Notificaciones_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Notificaciones_Crear
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
            FROM dbo.Plantillas
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
            FROM dbo.EstadosNotificaciones
            WHERE EstadoNotificacionCode = @EstadoNotificacion
              AND Estado = 1
        )
        BEGIN
            RAISERROR('El estado ''%s'' no existe o está inactivo.', 16, 1, @EstadoNotificacion);
            RETURN;
        END

        INSERT INTO dbo.Notificaciones (
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