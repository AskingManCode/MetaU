/* ============================================================
   BASE DE DATOS: tiusr20pl_Seguridad_Auditoria_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('tiusr20pl_Seguridad_Auditoria_DB') IS NULL
BEGIN
    CREATE DATABASE tiusr20pl_Seguridad_Auditoria_DB;
END
GO

USE tiusr20pl_Seguridad_Auditoria_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */

-- Crear schema si no existe
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'MetaU_DB_User')
    EXEC('CREATE SCHEMA MetaU_DB_User');
GO


/* ============================================================
   AUDITORÍA
   ============================================================ */
IF OBJECT_ID('MetaU_DB_User.Bitacora', 'U') IS NULL
    CREATE TABLE MetaU_DB_User.Bitacora (
        IdBitacora BIGINT IDENTITY(1,1) NOT NULL,
        Usuario UNIQUEIDENTIFIER NULL, -- REF: Usuarios_DB.Usuarios / NULL solo para errores técnicos
        Descripcion VARCHAR(MAX) NOT NULL, -- Para errores técnicos, JSON con { "error": ..., "endpoint": ... }
        FechaBitacora DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT PK_Bitacoras
            PRIMARY KEY CLUSTERED (IdBitacora),

        CONSTRAINT CH_Bitacoras_Descripcion_NoVacio
            CHECK (LEN(TRIM(Descripcion)) > 0
                    AND Descripcion NOT LIKE ' %'
                    AND Descripcion NOT LIKE '% '
                    AND Descripcion NOT LIKE '%  %')
    );
GO