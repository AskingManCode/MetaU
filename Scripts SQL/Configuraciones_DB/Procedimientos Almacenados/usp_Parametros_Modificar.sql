/* ============================================================
   STORED PROCEDURE: usp_Parametros_Modificar
   Descripción: Actualiza el valor de un parámetro existente
   Base de datos: Configuraciones_DB
   ============================================================ */

USE Configuraciones_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Parametros_Modificar
    @ParametroCode VARCHAR(10),
    @Valor VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @ParametroCode IS NULL OR LEN(TRIM(@ParametroCode)) = 0
        BEGIN
            RAISERROR('El código del parámetro es obligatorio.', 16, 1);
            RETURN;
        END

        IF @Valor IS NULL OR LEN(TRIM(@Valor)) = 0
        BEGIN
            RAISERROR('El valor del parámetro es obligatorio.', 16, 1);
            RETURN;
        END

        -- Verificar existencia
        IF NOT EXISTS (SELECT 1 FROM dbo.Parametros WHERE ParametroCode = UPPER(@ParametroCode))
        BEGIN
            -- No se encontró -> la aplicación recibe null
            RETURN;
        END

        UPDATE dbo.Parametros
        SET Valor = TRIM(@Valor)
        OUTPUT 
            INSERTED.ParametroCode,
            INSERTED.Valor,
            INSERTED.Estado
        WHERE ParametroCode = UPPER(@ParametroCode);

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