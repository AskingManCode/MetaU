/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Facturas_Anular
   Descripción: Anula una factura existente (cambia estado a ANU)
   Base de datos: tiusr20pl_Facturacion_DB
   ============================================================ */

USE tiusr20pl_Facturacion_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Facturas_Anular
    @FacturaID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @FacturaID IS NULL
        BEGIN
            RAISERROR('El identificador de la factura es obligatorio.', 16, 1);
            RETURN;
        END

        -- Verificar que la factura exista
        IF NOT EXISTS (SELECT 1 FROM MetaU_DB_User.Facturas WHERE FacturaID = @FacturaID)
        BEGIN
            -- No existe
            RETURN;
        END

        -- Verificar que no esté ya anulada
        IF EXISTS (
            SELECT 1 
            FROM MetaU_DB_User.Facturas 
            WHERE FacturaID = @FacturaID 
              AND EstadoFacturaCode = 'ANU'
        )
        BEGIN
            RAISERROR('La factura ya se encuentra anulada.', 16, 1);
            RETURN;
        END

        -- Verificar que exista el estado ANU activo
        IF NOT EXISTS (
            SELECT 1 
            FROM MetaU_DB_User.EstadosFacturas 
            WHERE EstadoFacturaCode = 'ANU' AND Estado = 1
        )
        BEGIN
            RAISERROR('No existe un estado activo ''ANU'' para anular facturas.', 16, 1);
            RETURN;
        END

        UPDATE MetaU_DB_User.Facturas
        SET 
            EstadoFacturaCode = 'ANU',
            FechaAnulacion = SYSDATETIME()
        WHERE FacturaID = @FacturaID
          AND EstadoFacturaCode <> 'ANU';

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