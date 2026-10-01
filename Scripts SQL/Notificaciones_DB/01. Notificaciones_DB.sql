/* ============================================================
   BASE DE DATOS: Notificaciones_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Notificaciones_DB') IS NULL
BEGIN
    CREATE DATABASE Notificaciones_DB;
END
GO

USE Notificaciones_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */


/* ============================================================
   CATÁLOGOS DE NOTIFICACIONES
   ============================================================ */
IF OBJECT_ID('dbo.EstadosNotificaciones', 'U') IS NULL
    CREATE TABLE EstadosNotificaciones (
        EstadoNotificacionCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(75) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_EstadosNotificaciones
            PRIMARY KEY CLUSTERED (EstadoNotificacionCode),

        CONSTRAINT UQ_EstadosNotificaciones_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_EstadosNotificaciones_EstadoNotificacionCode_Formato
            CHECK (LEN(TRIM(EstadoNotificacionCode)) BETWEEN 1 AND 15
                    AND EstadoNotificacionCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'),

        CONSTRAINT CH_EstadosNotificaciones_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO

IF OBJECT_ID('dbo.Plantillas', 'U') IS NULL
    CREATE TABLE Plantillas (
        PlantillaNotificacionCode VARCHAR(50) NOT NULL,
        Nombre VARCHAR(100) NOT NULL,
        AsuntoTemplate VARCHAR(200) NOT NULL,
        CuerpoTemplate VARCHAR(MAX) NOT NULL,
        EsHTML BIT NOT NULL DEFAULT 0,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Plantillas
            PRIMARY KEY CLUSTERED (PlantillaNotificacionCode),

        CONSTRAINT UQ_Plantillas_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_Plantillas_PlantillaNotificacionCode_Formato
            CHECK (LEN(TRIM(PlantillaNotificacionCode)) BETWEEN 1 AND 50
                    AND PlantillaNotificacionCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9_]%'),

        CONSTRAINT CH_Plantillas_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %'),

        CONSTRAINT CH_Plantillas_AsuntoTemplate_NoVacio
            CHECK (LEN(TRIM(AsuntoTemplate)) > 0
                    AND AsuntoTemplate NOT LIKE ' %'
                    AND AsuntoTemplate NOT LIKE '% '
                    AND AsuntoTemplate NOT LIKE '%  %'),

        CONSTRAINT CH_Plantillas_CuerpoTemplate_NoVacio
            CHECK (LEN(TRIM(CuerpoTemplate)) > 0)
    );
GO


/* ============================================================
   NOTIFICACIONES
   ============================================================ */
IF OBJECT_ID('dbo.Notificaciones', 'U') IS NULL
    CREATE TABLE Notificaciones (
        NotificacionID BIGINT IDENTITY(1,1) NOT NULL,
        UsuarioID UNIQUEIDENTIFIER NOT NULL, -- REF: Usuarios_DB.Usuarios
        EmailDestino VARCHAR(150) NOT NULL,
        PlantillaNotificacionCode VARCHAR(50) NOT NULL,
        ParametrosJson VARCHAR(MAX) NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        FechaEnvio DATETIME2 NULL,
        EstadoNotificacion VARCHAR(15) NOT NULL,
        MensajeError VARCHAR(500) NULL,
        NumeroIntentos TINYINT NOT NULL DEFAULT 0,
        FechaUltimoIntento DATETIME2 NULL,

        CONSTRAINT PK_Notificaciones
            PRIMARY KEY CLUSTERED (NotificacionID),

        CONSTRAINT FK_Notificaciones_Plantilla
            FOREIGN KEY (PlantillaNotificacionCode) 
            REFERENCES Plantillas(PlantillaNotificacionCode),

        CONSTRAINT FK_Notificaciones_EstadoNotificacion
            FOREIGN KEY (EstadoNotificacion) 
            REFERENCES EstadosNotificaciones(EstadoNotificacionCode),

        CONSTRAINT CH_Notificaciones_EmailDestino_Formato
            CHECK (LEN(TRIM(EmailDestino)) >= 7
                    AND EmailDestino NOT LIKE ' %'
                    AND EmailDestino NOT LIKE '% '
                    AND EmailDestino NOT LIKE '% %'
                    AND EmailDestino LIKE '%_@_%._%'
                    AND EmailDestino NOT LIKE '%@%@%'
                    AND EmailDestino NOT LIKE '%..%'
                    AND EmailDestino NOT LIKE '%@.%'
                    AND EmailDestino NOT LIKE '[.@]%'
                    AND EmailDestino NOT LIKE '%[@.]'),

        CONSTRAINT CH_Notificaciones_ParametrosJson_Valido
            CHECK (ParametrosJson IS NULL OR ISJSON(ParametrosJson) = 1),

        CONSTRAINT CH_Notificaciones_MensajeError_NoVacio
            CHECK (MensajeError IS NULL
                    OR (LEN(TRIM(MensajeError)) > 0
                        AND MensajeError NOT LIKE ' %'
                        AND MensajeError NOT LIKE '% '
                        AND MensajeError NOT LIKE '%  %')),

        CONSTRAINT CH_Notificaciones_FechaEnvio
            CHECK (FechaEnvio IS NULL OR FechaEnvio >= FechaCreacion),

        CONSTRAINT CH_Notificaciones_FechaUltimoIntento
            CHECK (FechaUltimoIntento IS NULL OR FechaUltimoIntento >= FechaCreacion)
    );
GO