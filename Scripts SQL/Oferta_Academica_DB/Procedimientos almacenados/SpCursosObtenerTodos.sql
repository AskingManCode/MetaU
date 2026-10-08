USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Cursos_ObtenerTodos] Fecha de script: 04/10/2026 20:40:09 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE   PROCEDURE [dbo].[usp_Cursos_ObtenerTodos]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CursoCode,
        CarreraCode,
        Nombre,
        Nivel,
        Estado
    FROM dbo.Cursos
END
GO

