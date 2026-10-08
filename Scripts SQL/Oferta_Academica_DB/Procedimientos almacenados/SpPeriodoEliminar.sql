USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Periodo_Eliminar] Fecha de script: 04/10/2026 20:41:46 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Periodo_Eliminar]
    @PeriodoID UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM dbo.Periodos
    WHERE PeriodoID = @PeriodoID
END
GO

