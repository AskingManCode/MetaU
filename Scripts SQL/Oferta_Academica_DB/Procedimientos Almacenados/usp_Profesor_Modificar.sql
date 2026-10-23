/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Profesor_Modificar
   Descripción: Actualiza un profesor y reemplaza sus teléfonos
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Profesor_Modificar
    @ProfesorID UNIQUEIDENTIFIER,
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
    UPDATE MetaU_DB_User.Profesores
    SET UsuarioID = @UsuarioID,
        TipoIdentificacionCode = @TipoIdentificacionCode,
        Identificacion = @Identificacion,
        Email = @Email,
        NombreCompleto = @NombreCompleto,
        FechaNacimiento = @FechaNacimiento,
        Estado = @Estado
    WHERE ProfesorID = @ProfesorID

    DELETE FROM MetaU_DB_User.TelefonosXProfesores
    WHERE ProfesorID = @ProfesorID

    INSERT INTO MetaU_DB_User.TelefonosXProfesores (ProfesorID, Telefono, Estado)
    SELECT @ProfesorID, Telefono, 1
    FROM @Telefonos
END
GO