/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Parametros_Eliminar
   Descripción: Elimina un parámetro (lógica o física)
   Base de datos: tiusr20pl_Configuraciones_DB
   ============================================================ */

USE tiusr20pl_Configuraciones_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Parametros_Eliminar
    @ParametroCode VARCHAR(10),
    @EliminacionFisica BIT = 0 -- 0 = lógica, 1 = física
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

        -- Verificar existencia
        IF NOT EXISTS (SELECT 1 FROM MetaU_DB_User.Parametros WHERE ParametroCode = UPPER(@ParametroCode))
        BEGIN
            RETURN;   -- No existe  
        END

        IF @EliminacionFisica = 1
        BEGIN
            -- Eliminación física
            DELETE FROM MetaU_DB_User.Parametros
            OUTPUT 
                DELETED.ParametroCode,
                DELETED.Valor,
                DELETED.Estado
            WHERE ParametroCode = UPPER(@ParametroCode);
        END
        ELSE
        BEGIN
            -- Eliminación lógica
            UPDATE MetaU_DB_User.Parametros
            SET Estado = 0
            OUTPUT 
                INSERTED.ParametroCode,
                INSERTED.Valor,
                INSERTED.Estado
            WHERE ParametroCode = UPPER(@ParametroCode);
        END

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