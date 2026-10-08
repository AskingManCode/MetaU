/* ============================================================
   STORED PROCEDURE: usp_Facturas_Crear
   Descripción: Crea una factura pendiente y su detalle.
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Facturas_Crear
    @IdentificacionEstudiante VARCHAR(30),
    @MatriculaID UNIQUEIDENTIFIER,
    @PeriodoID UNIQUEIDENTIFIER,
    @Monto DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EstudianteID UNIQUEIDENTIFIER;
    DECLARE @FacturaID UNIQUEIDENTIFIER;
    DECLARE @Impuesto DECIMAL(12,2);

    BEGIN TRY
        IF @IdentificacionEstudiante IS NULL OR LEN(TRIM(@IdentificacionEstudiante)) = 0
        BEGIN
            RAISERROR('La identificación del estudiante es obligatoria.', 16, 1);
            RETURN;
        END

        IF @Monto IS NULL OR @Monto <> 30000
        BEGIN
            RAISERROR('El monto debe ser 30000 colones.', 16, 1);
            RETURN;
        END

        IF @MatriculaID IS NULL
        BEGIN
            RAISERROR('El identificador de la matrícula es obligatorio.', 16, 1);
            RETURN;
        END

        IF @PeriodoID IS NULL
        BEGIN
            RAISERROR('El identificador del periodo es obligatorio.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.EstadosFacturas
            WHERE EstadoFacturaCode = 'PEND'
              AND Estado = 1
        )
        BEGIN
            RAISERROR('No existe un estado activo para crear facturas pendientes.', 16, 1);
            RETURN;
        END

        BEGIN TRANSACTION;

        SELECT @EstudianteID = estudiante.EstudianteID
        FROM Matriculas_DB.dbo.Matriculas AS matricula
        INNER JOIN Matriculas_DB.dbo.Estudiantes AS estudiante
            ON estudiante.EstudianteID = matricula.EstudianteID
        WHERE matricula.MatriculaID = @MatriculaID
          AND matricula.PeriodoID = @PeriodoID
          AND matricula.Estado = 1
          AND estudiante.Identificacion = TRIM(@IdentificacionEstudiante)
          AND estudiante.Estado = 1;

        IF @EstudianteID IS NULL
        BEGIN
            RAISERROR('La matrícula no corresponde a un estudiante activo con esa identificación.', 16, 1);
            RETURN;
        END

        IF EXISTS (
            SELECT 1
            FROM dbo.Facturas WITH (UPDLOCK, HOLDLOCK)
            WHERE MatriculaID = @MatriculaID
        )
        BEGIN
            RAISERROR('Ya existe una factura para la matrícula indicada.', 16, 1);
            RETURN;
        END

        SET @Impuesto = ROUND(@Monto * 2 / 100, 2);

        DECLARE @FacturaCreada TABLE (FacturaID UNIQUEIDENTIFIER);

        INSERT INTO dbo.Facturas
            (EstudianteID, MatriculaID, PeriodoID, EstadoFacturaCode,
             Subtotal, PorcentajeImpuesto, Impuesto, Total)
        OUTPUT INSERTED.FacturaID INTO @FacturaCreada
        VALUES
            (@EstudianteID, @MatriculaID, @PeriodoID, 'PEND',
             @Monto, 2, @Impuesto, @Monto + @Impuesto);

        SELECT @FacturaID = FacturaID FROM @FacturaCreada;

        INSERT INTO dbo.DetallesFacturas (FacturaID, Descripcion, Monto)
        VALUES (@FacturaID, N'Servicios estudiantiles', @Monto);

        COMMIT TRANSACTION;

        SELECT @FacturaID AS FacturaID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        DECLARE
            @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrorSeverity INT = ERROR_SEVERITY(),
            @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
