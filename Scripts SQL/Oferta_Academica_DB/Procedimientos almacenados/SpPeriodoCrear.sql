USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Periodo_Crear] Fecha de script: 04/10/2026 20:41:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Periodo_Crear]
    @Anio SMALLINT, @NumeroPeriodo INT, @FechaInicio DATE, @FechaFin DATE, @Estado BIT
AS
BEGIN
    INSERT INTO dbo.Periodos (Anio, NumeroPeriodo, FechaInicio, FechaFin, Estado)
    OUTPUT INSERTED.PeriodoID, INSERTED.Anio, INSERTED.NumeroPeriodo, INSERTED.FechaInicio, INSERTED.FechaFin, INSERTED.Estado
    VALUES (@Anio, @NumeroPeriodo, @FechaInicio, @FechaFin, @Estado)
END
GO

