USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Grupo_Eliminar] Fecha de script: 04/10/2026 20:40:39 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Grupo_Eliminar]
    @GrupoCode VARCHAR(15)
AS
BEGIN
    DELETE FROM dbo.Grupos
    WHERE GrupoCode = @GrupoCode
END
GO

