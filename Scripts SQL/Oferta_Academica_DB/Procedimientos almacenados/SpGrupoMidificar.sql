USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Grupo_Modificar] Fecha de script: 04/10/2026 20:40:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Grupo_Modificar]
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
    UPDATE dbo.Grupos
    SET NumeroGrupo = @NumeroGrupo,
        CursoCode = @CursoCode,
        ProfesorID = @ProfesorID,
        Horario = @Horario,
        Cupo = @Cupo,
        PeriodoID = @PeriodoID,
        Estado = @Estado
    WHERE GrupoCode = @GrupoCode
END
GO

