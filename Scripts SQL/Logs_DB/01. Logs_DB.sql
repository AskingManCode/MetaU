/* ============================================================
   BASE DE DATOS: Logs_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Logs_DB') IS NULL
BEGIN
    CREATE DATABASE Logs_DB;
END
GO

USE Logs_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */


/* ============================================================
   1. AUDITORÍA
   ============================================================ */
IF OBJECT_ID('dbo.Bitacoras', 'U') IS NULL
    CREATE TABLE Bitacoras (
        BitacoraID BIGINT IDENTITY(1,1) NOT NULL,
        UsuarioID UNIQUEIDENTIFIER NULL, -- REF: Usuarios_DB.Usuarios / NULL solo para errores técnicos
        Accion VARCHAR(200) NOT NULL,
        DescripcionJson VARCHAR(MAX) NULL, -- NULL solo para consultas. Para errores técnicos, JSON con { "error": ..., "endpoint": ... }
        FechaRegistro DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT PK_Bitacoras
            PRIMARY KEY CLUSTERED (BitacoraID),

        CONSTRAINT CH_Bitacoras_Accion_NoVacio
            CHECK (LEN(TRIM(Accion)) BETWEEN 3 AND 200
                    AND Accion NOT LIKE ' %'
                    AND Accion NOT LIKE '% '
                    AND Accion NOT LIKE '%  %'),

        CONSTRAINT CH_Bitacoras_DescripcionJson_Valido
            CHECK (DescripcionJson IS NULL OR ISJSON(DescripcionJson) = 1)
    );
GO