/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Periodo_ObtenerTodos
   Descripción: Obtiene todos los periodos
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Periodo_ObtenerTodos
AS
BEGIN
    SELECT PeriodoID, Anio, NumeroPeriodo, FechaInicio, FechaFin, Estado
    FROM MetaU_DB_User.Periodos
END
GO