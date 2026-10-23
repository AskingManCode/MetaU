/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Facturas_Crear
   Descripción: Crea el encabezado de una factura pendiente
   Base de datos: tiusr20pl_Facturacion_DB
   NOTA: La transacción la controla el repositorio (C#)
   ============================================================ */

USE tiusr20pl_Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Facturas_Crear
    @IdentificacionEstudiante VARCHAR(30),
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

    IF @IdentificacionEstudiante IS NULL OR LEN(TRIM(@IdentificacionEstudiante)) = 0
    BEGIN
        RAISERROR('La identificación del estudiante es obligatoria.', 16, 1);
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
        SELECT 1 FROM MetaU_DB_User.EstadosFacturas 
        WHERE EstadoFacturaCode = 'PEND' AND Estado = 1
    )
    BEGIN
        RAISERROR('No existe un estado activo ''PEND'' para crear facturas.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1 FROM MetaU_DB_User.Facturas WITH (UPDLOCK, HOLDLOCK)
        WHERE MatriculaID = @MatriculaID
    )
    BEGIN
        RAISERROR('Ya existe una factura para la matrícula indicada.', 16, 1);
        RETURN;
    END

    SET @Impuesto = ROUND(@Monto * 2.00 / 100, 2);
    SET @Total = @Monto + @Impuesto;

    DECLARE @FacturaCreada TABLE (FacturaID UNIQUEIDENTIFIER);

    INSERT INTO MetaU_DB_User.Facturas
    (
        IdentificacionEstudiante,
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
        TRIM(@IdentificacionEstudiante),
        @MatriculaID,
        @PeriodoID,
        'PEND',
        @Monto,
        2.00,
        @Impuesto,
        @Total
    );

    SELECT @FacturaID = FacturaID FROM @FacturaCreada;

    SELECT @FacturaID AS FacturaID;
END
GO