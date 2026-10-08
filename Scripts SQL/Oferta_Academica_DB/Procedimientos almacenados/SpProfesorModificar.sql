USE [Oferta_Academica_DB]
GO

/****** Objeto: StoredProcedure [dbo].[usp_Profesor_Modificar] Fecha de script: 04/10/2026 20:43:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[usp_Profesor_Modificar]
    @ProfesorID UNIQUEIDENTIFIER,
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
    UPDATE dbo.Profesores
    SET UsuarioID = @UsuarioID,
        TipoIdentificacionCode = @TipoIdentificacionCode,
        Identificacion = @Identificacion,
        Email = @Email,
        NombreCompleto = @NombreCompleto,
        FechaNacimiento = @FechaNacimiento,
        Estado = @Estado
    WHERE ProfesorID = @ProfesorID

    DELETE FROM dbo.TelefonosXProfesores
    WHERE ProfesorID = @ProfesorID

    INSERT INTO dbo.TelefonosXProfesores (ProfesorID, Telefono, Estado)
    SELECT @ProfesorID, Telefono, 1
    FROM @Telefonos
END
GO

