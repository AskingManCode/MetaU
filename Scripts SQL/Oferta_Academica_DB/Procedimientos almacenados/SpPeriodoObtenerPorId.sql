USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Periodo_ObtenerPorId] Fecha de script: 04/10/2026 20:42:09 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Periodo_ObtenerPorId]
    @PeriodoID UNIQUEIDENTIFIER
AS
BEGIN
    SELECT PeriodoID, Anio, NumeroPeriodo, FechaInicio, FechaFin, Estado
    FROM dbo.Periodos
    WHERE PeriodoID = @PeriodoID
END
GO

