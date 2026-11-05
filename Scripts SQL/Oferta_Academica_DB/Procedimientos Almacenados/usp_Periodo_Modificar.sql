/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Periodo_Modificar
   Descripción: Actualiza los datos de un periodo existente
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Periodo_Modificar
    @PeriodoID UNIQUEIDENTIFIER, 
    @Anio SMALLINT, 
    @NumeroPeriodo INT, 
    @FechaInicio DATE, 
    @FechaFin DATE, 
    @Estado BIT
AS
BEGIN
    UPDATE MetaU_DB_User.Periodos
    SET Anio = @Anio, 
        NumeroPeriodo = @NumeroPeriodo, 
        FechaInicio = @FechaInicio, 
        FechaFin = @FechaFin, 
        Estado = @Estado
    WHERE PeriodoID = @PeriodoID
END
GO