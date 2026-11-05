/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Grupo_Crear
   Descripción: Crea un nuevo grupo
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Grupo_Crear
    @GrupoCode VARCHAR(15),
    @NumeroGrupo TINYINT,
    @CursoCode VARCHAR(15),
    @ProfesorID UNIQUEIDENTIFIER,
    @Horario VARCHAR(30),
    @Cupo INT,
    @PeriodoID UNIQUEIDENTIFIER,
    @Estado BIT
AS
BEGIN
    INSERT INTO MetaU_DB_User.Grupos
    (
        GrupoCode,
        NumeroGrupo,
        CursoCode,
        ProfesorID,
        Horario,
        Cupo,
        PeriodoID,
        Estado
    )
    VALUES
    (
        @GrupoCode,
        @NumeroGrupo,
        @CursoCode,
        @ProfesorID,
        @Horario,
        @Cupo,
        @PeriodoID,
        @Estado
    )
END
GO