/* ============================================================
   STORED PROCEDURE: usp_Parametros_Crear
   Descripción: Inserta un nuevo parámetro en la tabla Parametros
   Base de datos: Configuraciones_DB
   ============================================================ */

USE Configuraciones_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Parametros_Crear
    @ParametroCode VARCHAR(10),
    @Valor VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        -- Validaciones básicas (las constraints de tabla también protegen)
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

        -- Verificar si ya existe
        IF EXISTS (SELECT 1 FROM dbo.Parametros WHERE ParametroCode = @ParametroCode)
        BEGIN
            RAISERROR('Ya existe un parámetro con el código ''%s''.', 16, 1, @ParametroCode);
            RETURN;
        END

        INSERT INTO dbo.Parametros (ParametroCode, Valor)
        OUTPUT 
            INSERTED.ParametroCode,
            INSERTED.Valor,
            INSERTED.Estado
        VALUES (
            UPPER(@ParametroCode),
            TRIM(@Valor)
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