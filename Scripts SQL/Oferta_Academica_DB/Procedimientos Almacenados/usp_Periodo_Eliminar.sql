/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Periodo_Eliminar
   Descripción: Elimina un periodo por su identificador
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Periodo_Eliminar
    @PeriodoID UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM MetaU_DB_User.Periodos
    WHERE PeriodoID = @PeriodoID
END
GO