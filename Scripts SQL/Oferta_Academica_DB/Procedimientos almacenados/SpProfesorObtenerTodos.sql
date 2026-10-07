USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Profesor_ObtenerTodos] Fecha de script: 04/10/2026 20:43:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Profesor_ObtenerTodos]
AS
BEGIN
    SELECT
        p.ProfesorID,
        p.UsuarioID,
        p.TipoIdentificacionCode,
        p.Identificacion,
        p.Email,
        p.NombreCompleto,
        p.FechaNacimiento,
        p.Estado,
        t.Telefono
    FROM dbo.Profesores p
    LEFT JOIN dbo.TelefonosXProfesores t ON p.ProfesorID = t.ProfesorID
END
GO

