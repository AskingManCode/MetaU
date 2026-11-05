/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Periodo_Crear
   Descripción: Crea un nuevo periodo académico
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Periodo_Crear
    @Anio SMALLINT, 
    @NumeroPeriodo INT, 
    @FechaInicio DATE, 
    @FechaFin DATE, 
    @Estado BIT
AS
BEGIN
    INSERT INTO MetaU_DB_User.Periodos (Anio, NumeroPeriodo, FechaInicio, FechaFin, Estado)
    OUTPUT INSERTED.PeriodoID, INSERTED.Anio, INSERTED.NumeroPeriodo, INSERTED.FechaInicio, INSERTED.FechaFin, INSERTED.Estado
    VALUES (@Anio, @NumeroPeriodo, @FechaInicio, @FechaFin, @Estado)
END
GO