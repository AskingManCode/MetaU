/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Grupo_Modificar
   Descripción: Actualiza los datos de un grupo existente
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Grupo_Modificar
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
    UPDATE MetaU_DB_User.Grupos
    SET NumeroGrupo = @NumeroGrupo,
        CursoCode = @CursoCode,
        ProfesorID = @ProfesorID,
        Horario = @Horario,
        Cupo = @Cupo,
        PeriodoID = @PeriodoID,
        Estado = @Estado
    WHERE GrupoCode = @GrupoCode
END
GO