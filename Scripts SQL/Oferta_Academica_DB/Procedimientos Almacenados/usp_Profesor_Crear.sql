/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Profesor_Crear
   Descripción: Crea un profesor y sus teléfonos asociados
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Profesor_Crear
    @UsuarioID UNIQUEIDENTIFIER,
    @TipoIdentificacionCode VARCHAR(15),
    @Identificacion VARCHAR(30),
    @Email VARCHAR(150),
    @NombreCompleto VARCHAR(175),
    @FechaNacimiento DATE,
    @Estado BIT,
    @Telefonos MetaU_DB_User.TelefonoProfesorType READONLY
AS
BEGIN
    DECLARE @ProfesorCreado TABLE (ProfesorID UNIQUEIDENTIFIER)
    DECLARE @ProfesorID UNIQUEIDENTIFIER

    INSERT INTO MetaU_DB_User.Profesores
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

    INSERT INTO MetaU_DB_User.TelefonosXProfesores (ProfesorID, Telefono, Estado)
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
    FROM MetaU_DB_User.Profesores p
    LEFT JOIN MetaU_DB_User.TelefonosXProfesores t ON p.ProfesorID = t.ProfesorID
    WHERE p.ProfesorID = @ProfesorID
END
GO