/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Cursos_ObtenerTodos
   Descripción: Obtiene todos los cursos
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Cursos_ObtenerTodos
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
END
GO