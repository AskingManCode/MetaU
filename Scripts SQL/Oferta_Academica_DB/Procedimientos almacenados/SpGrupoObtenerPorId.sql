USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Grupo_ObtenerPorId] Fecha de script: 04/10/2026 20:41:07 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Grupo_ObtenerPorId]
    @GrupoCode VARCHAR(15)
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
    WHERE GrupoCode = @GrupoCode
END
GO

