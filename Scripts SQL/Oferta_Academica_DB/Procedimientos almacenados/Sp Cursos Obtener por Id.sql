USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Cursos_ObtenerPorId] Fecha de script: 04/10/2026 20:39:57 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE   PROCEDURE [dbo].[usp_Cursos_ObtenerPorId]
    @CursoCode VARCHAR(15)
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
    WHERE CursoCode = @CursoCode
END
GO

