USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Cursos_Modificar] Fecha de script: 04/10/2026 20:38:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE   PROCEDURE [dbo].[usp_Cursos_Modificar]
    @CursoCode VARCHAR(15),
    @CarreraCode VARCHAR(15),
    @Nombre VARCHAR(150),
    @Nivel TINYINT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Cursos
    SET
        CarreraCode = @CarreraCode,
        Nombre = @Nombre,
        Nivel = @Nivel,
        Estado = @Estado
    WHERE CursoCode = @CursoCode
END
GO

