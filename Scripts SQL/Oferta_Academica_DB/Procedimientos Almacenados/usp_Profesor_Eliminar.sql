/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Profesor_Eliminar
   Descripción: Elimina un profesor y sus teléfonos asociados
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Profesor_Eliminar
    @ProfesorID UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM MetaU_DB_User.TelefonosXProfesores
    WHERE ProfesorID = @ProfesorID

    DELETE FROM MetaU_DB_User.Profesores
    WHERE ProfesorID = @ProfesorID
END
GO