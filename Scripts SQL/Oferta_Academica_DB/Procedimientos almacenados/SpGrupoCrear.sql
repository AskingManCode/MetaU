USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Grupo_Crear] Fecha de script: 04/10/2026 20:40:29 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Grupo_Crear]
    @GrupoCode VARCHAR(15),
    @NumeroGrupo TINYINT,
    @CursoCode VARCHAR(15),
    @ProfesorID UNIQUEIDENTIFIER,
    @Horario VARCHAR(30),
    @Cupo INT,
    @PeriodoID UNIQUEIDENTIFIER,
    @Estado BIT
AS
BEGIN
    INSERT INTO dbo.Grupos
    (
        GrupoCode,
        NumeroGrupo,
        CursoCode,
        ProfesorID,
        Horario,
        Cupo,
        PeriodoID,
        Estado
    )
    VALUES
    (
        @GrupoCode,
        @NumeroGrupo,
        @CursoCode,
        @ProfesorID,
        @Horario,
        @Cupo,
        @PeriodoID,
        @Estado
    )
END
GO

