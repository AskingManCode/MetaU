/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Facturas_AgregarDetalle
   Descripción: Agrega un detalle a una factura existente
   Base de datos: tiusr20pl_Facturacion_DB
   ============================================================ */

USE tiusr20pl_Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Facturas_AgregarDetalle
    @FacturaID UNIQUEIDENTIFIER,
    @CursoCode VARCHAR(15),
    @Descripcion VARCHAR(150),
    @Monto DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @FacturaID IS NULL
    BEGIN
        RAISERROR('El identificador de la factura es obligatorio.', 16, 1);
        RETURN;
    END

    IF @CursoCode IS NULL OR LEN(TRIM(@CursoCode)) = 0
    BEGIN
        RAISERROR('El código del curso es obligatorio.', 16, 1);
        RETURN;
    END

    IF @Descripcion IS NULL OR LEN(TRIM(@Descripcion)) = 0
    BEGIN
        RAISERROR('La descripción del detalle es obligatoria.', 16, 1);
        RETURN;
    END

    IF @Monto IS NULL OR @Monto <= 0
    BEGIN
        RAISERROR('El monto del detalle debe ser mayor que cero.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM MetaU_DB_User.Facturas WHERE FacturaID = @FacturaID)
    BEGIN
        RAISERROR('No existe una factura con el identificador indicado.', 16, 1);
        RETURN;
    END

    INSERT INTO MetaU_DB_User.DetallesFacturas
    (
        FacturaID,
        CursoCode,
        Descripcion,
        Monto
    )
    VALUES
    (
        @FacturaID,
        UPPER(TRIM(@CursoCode)),
        TRIM(@Descripcion),
        @Monto
    );

    -- Devolver el detalle recién creado (opcional, el repositorio no lo usa)
    SELECT 
        DetalleFacturaID,
        FacturaID,
        CursoCode,
        Descripcion,
        Monto
    FROM MetaU_DB_User.DetallesFacturas
    WHERE DetalleFacturaID = SCOPE_IDENTITY();
END
GO