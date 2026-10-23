/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Cursos_ObtenerPorCarrera
   Descripción: Obtiene los cursos de una carrera
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Cursos_ObtenerPorCarrera
    @CarreraCode VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CursoCode,
        CarreraCode,
        Nombre,
        Nivel,
        Estado
    FROM MetaU_DB_User.Cursos
    WHERE CarreraCode = @CarreraCode
END
GO