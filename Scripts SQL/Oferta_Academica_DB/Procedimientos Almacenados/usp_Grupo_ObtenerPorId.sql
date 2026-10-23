/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Grupo_ObtenerPorId
   Descripción: Obtiene un grupo por su código
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Grupo_ObtenerPorId
    @GrupoCode VARCHAR(15)
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
    WHERE GrupoCode = @GrupoCode
END
GO