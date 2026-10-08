USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Grupo_ObtenerTodos] Fecha de script: 04/10/2026 20:41:18 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Grupo_ObtenerTodos]
AS
BEGIN
    SELECT
        GrupoCode,
        NumeroGrupo,
        CursoCode,
        ProfesorID,
        Horario,
        Cupo,
        PeriodoID,
        Estado
    FROM dbo.Grupos
END
GO

