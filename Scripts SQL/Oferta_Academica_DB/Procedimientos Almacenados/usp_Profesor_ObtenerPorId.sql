/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Profesor_ObtenerPorId
   Descripción: Obtiene un profesor y sus teléfonos por identificador
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Profesor_ObtenerPorId
    @ProfesorID UNIQUEIDENTIFIER
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
    FROM MetaU_DB_User.Profesores p
    LEFT JOIN MetaU_DB_User.TelefonosXProfesores t ON p.ProfesorID = t.ProfesorID
    WHERE p.ProfesorID = @ProfesorID
END
GO