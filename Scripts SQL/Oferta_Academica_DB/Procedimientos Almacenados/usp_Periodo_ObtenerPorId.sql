/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Periodo_ObtenerPorId
   Descripción: Obtiene un periodo por su identificador
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Periodo_ObtenerPorId
    @PeriodoID UNIQUEIDENTIFIER
AS
BEGIN
    SELECT PeriodoID, Anio, NumeroPeriodo, FechaInicio, FechaFin, Estado
    FROM MetaU_DB_User.Periodos
    WHERE PeriodoID = @PeriodoID
END
GO