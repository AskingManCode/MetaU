/* ============================================================
   STORED PROCEDURE: usp_Facturas_Crear
   Descripción: Crea el encabezado de una factura pendiente
   Base de datos: Facturacion_DB
   ============================================================ */

USE Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Facturas_Crear
    @EstudianteID UNIQUEIDENTIFIER,
    @MatriculaID UNIQUEIDENTIFIER,
    @PeriodoID UNIQUEIDENTIFIER,
    @Monto DECIMAL(12,2) 
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @FacturaID UNIQUEIDENTIFIER;
    DECLARE @Impuesto DECIMAL(12,2);
    DECLARE @Total DECIMAL(12,2);

    BEGIN TRY
        IF @EstudianteID IS NULL
        BEGIN
            RAISERROR('El identificador del estudiante es obligatorio.', 16, 1);
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

        IF @Monto IS NULL OR @Monto <= 0
        BEGIN
            RAISERROR('El monto debe ser mayor que cero.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.EstadosFacturas 
            WHERE EstadoFacturaCode = 'PEND' AND Estado = 1
        )
        BEGIN
            RAISERROR('No existe un estado activo ''PEND'' para crear facturas.', 16, 1);
            RETURN;
        END

        IF EXISTS (
            SELECT 1 
            FROM dbo.Facturas
            WHERE MatriculaID = @MatriculaID
        )
        BEGIN
            RAISERROR('Ya existe una factura para la matrícula indicada.', 16, 1);
            RETURN;
        END

        SET @Impuesto = ROUND(@Monto * 2.00 / 100, 2);
        SET @Total = @Monto + @Impuesto;

        BEGIN TRANSACTION;

        DECLARE @FacturaCreada TABLE (FacturaID UNIQUEIDENTIFIER);

        INSERT INTO dbo.Facturas
        (
            EstudianteID,
            MatriculaID,
            PeriodoID,
            EstadoFacturaCode,
            Subtotal,
            PorcentajeImpuesto,
            Impuesto,
            Total
        )
        OUTPUT INSERTED.FacturaID INTO @FacturaCreada
        VALUES
        (
            @EstudianteID,
            @MatriculaID,
            @PeriodoID,
            'PEND',
            @Monto,
            2.00,
            @Impuesto,
            @Total
        );

        SELECT @FacturaID = FacturaID FROM @FacturaCreada;

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