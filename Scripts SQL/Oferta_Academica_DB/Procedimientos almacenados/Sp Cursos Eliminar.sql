USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Cursos_Eliminar] Fecha de script: 04/10/2026 20:38:41 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE   PROCEDURE [dbo].[usp_Cursos_Eliminar]
    @CursoCode VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Cursos
    WHERE CursoCode = @CursoCode
END
GO

