/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Cursos_Modificar
   Descripción: Actualiza los datos de un curso existente
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Cursos_Modificar
    @CursoCode VARCHAR(15),
    @CarreraCode VARCHAR(15),
    @Nombre VARCHAR(150),
    @Nivel TINYINT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE MetaU_DB_User.Cursos
    SET
        CarreraCode = @CarreraCode,
        Nombre = @Nombre,
        Nivel = @Nivel,
        Estado = @Estado
    WHERE CursoCode = @CursoCode
END
GO