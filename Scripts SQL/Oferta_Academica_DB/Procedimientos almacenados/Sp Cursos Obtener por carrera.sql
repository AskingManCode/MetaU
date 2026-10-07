USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Cursos_ObtenerPorCarrera] Fecha de script: 04/10/2026 20:39:45 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE   PROCEDURE [dbo].[usp_Cursos_ObtenerPorCarrera]
    @CarreraCode VARCHAR(15)
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
    WHERE CarreraCode = @CarreraCode
END
GO

