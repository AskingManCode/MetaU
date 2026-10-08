USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Cursos_Crear] Fecha de script: 04/10/2026 20:38:28 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE   PROCEDURE [dbo].[usp_Cursos_Crear]
    @CursoCode VARCHAR(15),
    @CarreraCode VARCHAR(15),
    @Nombre VARCHAR(150),
    @Nivel TINYINT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Cursos
    (
        CursoCode,
        CarreraCode,
        Nombre,
        Nivel,
        Estado
    )
    VALUES
    (
        @CursoCode,
        @CarreraCode,
        @Nombre,
        @Nivel,
        @Estado
    )
END
GO

