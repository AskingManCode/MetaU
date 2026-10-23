/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Cursos_Eliminar
   Descripción: Elimina un curso por su código
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Cursos_Eliminar
    @CursoCode VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM MetaU_DB_User.Cursos
    WHERE CursoCode = @CursoCode
END
GO