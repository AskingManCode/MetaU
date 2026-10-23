/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Cursos_Crear
   Descripción: Crea un nuevo curso
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Cursos_Crear
    @CursoCode VARCHAR(15),
    @CarreraCode VARCHAR(15),
    @Nombre VARCHAR(150),
    @Nivel TINYINT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO MetaU_DB_User.Cursos
    (
        CursoCode,
        CarreraCode,
        Nombre,
        Nivel,
        Estado
    )
    VALUES
    (
        @CursoCode,
        @CarreraCode,
        @Nombre,
        @Nivel,
        @Estado
    )
END
GO