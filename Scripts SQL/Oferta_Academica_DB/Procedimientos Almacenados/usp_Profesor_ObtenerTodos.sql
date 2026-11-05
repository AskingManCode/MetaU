/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Profesor_ObtenerTodos
   Descripción: Obtiene todos los profesores y sus teléfonos
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Profesor_ObtenerTodos
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
END
GO