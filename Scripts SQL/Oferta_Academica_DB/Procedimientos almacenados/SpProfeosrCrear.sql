USE [Oferta_Academica_DBB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Profesor_Crear] Fecha de script: 04/10/2026 20:42:39 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Profesor_Crear]
    @UsuarioID UNIQUEIDENTIFIER,
    @TipoIdentificacionCode VARCHAR(15),
    @Identificacion VARCHAR(30),
    @Email VARCHAR(150),
    @NombreCompleto VARCHAR(175),
    @FechaNacimiento DATE,
    @Estado BIT,
    @Telefonos dbo.TelefonoProfesorType READONLY
AS
BEGIN
    DECLARE @ProfesorCreado TABLE (ProfesorID UNIQUEIDENTIFIER)
    DECLARE @ProfesorID UNIQUEIDENTIFIER

    INSERT INTO dbo.Profesores
    (
        UsuarioID,
        TipoIdentificacionCode,
        Identificacion,
        Email,
        NombreCompleto,
        FechaNacimiento,
        Estado
    )
    OUTPUT INSERTED.ProfesorID INTO @ProfesorCreado
    VALUES
    (
        @UsuarioID,
        @TipoIdentificacionCode,
        @Identificacion,
        @Email,
        @NombreCompleto,
        @FechaNacimiento,
        @Estado
    )

    SELECT @ProfesorID = ProfesorID
    FROM @ProfesorCreado

    INSERT INTO dbo.TelefonosXProfesores (ProfesorID, Telefono, Estado)
    SELECT @ProfesorID, Telefono, 1
    FROM @Telefonos

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
    WHERE p.ProfesorID = @ProfesorID
END
GO

