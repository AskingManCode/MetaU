USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Periodo_ObtenerTodos] Fecha de script: 04/10/2026 20:42:23 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Periodo_ObtenerTodos]
AS
BEGIN
    SELECT PeriodoID, Anio, NumeroPeriodo, FechaInicio, FechaFin, Estado
    FROM dbo.Periodos
END
GO

