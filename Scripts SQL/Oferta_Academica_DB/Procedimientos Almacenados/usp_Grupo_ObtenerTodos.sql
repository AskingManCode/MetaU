/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Grupo_ObtenerTodos
   Descripción: Obtiene todos los grupos
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Grupo_ObtenerTodos
AS
BEGIN
    SELECT
        GrupoCode,
        NumeroGrupo,
        CursoCode,
        ProfesorID,
        Horario,
        Cupo,
        PeriodoID,
        Estado
    FROM MetaU_DB_User.Grupos
END
GO