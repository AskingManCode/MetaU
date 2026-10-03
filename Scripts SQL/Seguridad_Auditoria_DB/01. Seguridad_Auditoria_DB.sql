/* ============================================================
   BASE DE DATOS: Logs_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Seguridad_Auditoria_DB') IS NULL
BEGIN
    CREATE DATABASE Seguridad_Auditoria_DB;
END
GO

USE Seguridad_Auditoria_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */


/* ============================================================
   AUDITORÍA
   ============================================================ */
IF OBJECT_ID('dbo.Bitacora', 'U') IS NULL
    CREATE TABLE Bitacora (
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