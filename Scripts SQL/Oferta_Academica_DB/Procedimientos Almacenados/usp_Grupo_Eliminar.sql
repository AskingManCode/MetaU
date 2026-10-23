/* ============================================================
   STORED PROCEDURE: MetaU_DB_User.usp_Grupo_Eliminar
   Descripción: Elimina un grupo por su código
   Base de datos: tiusr20pl_Oferta_Academica_DB
   ============================================================ */

USE tiusr20pl_Oferta_Academica_DB;
GO

CREATE OR ALTER PROCEDURE MetaU_DB_User.usp_Grupo_Eliminar
    @GrupoCode VARCHAR(15)
AS
BEGIN
    DELETE FROM MetaU_DB_User.Grupos
    WHERE GrupoCode = @GrupoCode
END
GO