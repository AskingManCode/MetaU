USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Profesor_Eliminar] Fecha de script: 04/10/2026 20:42:52 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Profesor_Eliminar]
    @ProfesorID UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM dbo.TelefonosXProfesores
    WHERE ProfesorID = @ProfesorID

    DELETE FROM dbo.Profesores
    WHERE ProfesorID = @ProfesorID
END
GO

