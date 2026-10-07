USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Periodo_Modificar] Fecha de script: 04/10/2026 20:41:59 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Periodo_Modificar]
    @PeriodoID UNIQUEIDENTIFIER, @Anio SMALLINT, @NumeroPeriodo INT, @FechaInicio DATE, @FechaFin DATE, @Estado BIT
AS
BEGIN
    UPDATE dbo.Periodos
    SET Anio = @Anio, NumeroPeriodo = @NumeroPeriodo, FechaInicio = @FechaInicio, FechaFin = @FechaFin, Estado = @Estado
    WHERE PeriodoID = @PeriodoID
END
GO

