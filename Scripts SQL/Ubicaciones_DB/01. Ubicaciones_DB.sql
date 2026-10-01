/* ============================================================
   BASE DE DATOS: Ubicaciones_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Ubicaciones_DB') IS NULL
BEGIN
    CREATE DATABASE Ubicaciones_DB;
END
GO

USE Ubicaciones_DB;
GO


/* ============================================================
   PROVINCIAS
   ============================================================ */
IF OBJECT_ID('dbo.Provincias', 'U') IS NULL
    CREATE TABLE Provincias (
        ProvinciaID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        Nombre VARCHAR(50) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Provincias
            PRIMARY KEY CLUSTERED (ProvinciaID),

        CONSTRAINT UQ_Provincias_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_Provincias_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO


/* ============================================================
   CANTONES
   ============================================================ */
IF OBJECT_ID('dbo.Cantones', 'U') IS NULL
    CREATE TABLE Cantones (
        CantonID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        ProvinciaID UNIQUEIDENTIFIER NOT NULL,
        Nombre VARCHAR(50) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Cantones
            PRIMARY KEY CLUSTERED (CantonID),

        CONSTRAINT FK_Cantones_Provincia
            FOREIGN KEY (ProvinciaID) REFERENCES Provincias(ProvinciaID),

        CONSTRAINT UQ_Cantones_Provincia_Nombre
            UNIQUE (ProvinciaID, Nombre),

        CONSTRAINT UQ_Cantones_ProvinciaID_CantonID
            UNIQUE (ProvinciaID, CantonID),

        CONSTRAINT CH_Cantones_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO


/* ============================================================
   DISTRITOS
   ============================================================ */
IF OBJECT_ID('dbo.Distritos', 'U') IS NULL
    CREATE TABLE Distritos (
        DistritoID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        CantonID UNIQUEIDENTIFIER NOT NULL,
        ProvinciaID UNIQUEIDENTIFIER NOT NULL,
        Nombre VARCHAR(50) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Distritos
            PRIMARY KEY CLUSTERED (DistritoID),

        CONSTRAINT FK_Distritos_Provincia
            FOREIGN KEY (ProvinciaID) REFERENCES Provincias(ProvinciaID),

        CONSTRAINT FK_Distritos_ProvinciaCanton
            FOREIGN KEY (ProvinciaID, CantonID) REFERENCES Cantones(ProvinciaID, CantonID),

        CONSTRAINT UQ_Distritos_Canton_Nombre
            UNIQUE (CantonID, Nombre),

        CONSTRAINT CH_Distritos_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO