/* ============================================================
   BASE DE DATOS: Usuarios_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Usuarios_DB') IS NULL
BEGIN
    CREATE DATABASE Usuarios_DB;
END
GO

USE Usuarios_DB;
GO


/* ============================================================
   CATÁLOGOS DE SEGURIDAD
   ============================================================ */
IF OBJECT_ID('dbo.TiposIdentificacion', 'U') IS NULL
    CREATE TABLE TiposIdentificacion (
        TipoIdentificacionCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(75) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_TiposIdentificacion
            PRIMARY KEY CLUSTERED (TipoIdentificacionCode),

        CONSTRAINT UQ_TiposIdentificacion_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_TiposIdentificacion_TipoIdentificacionCode_Formato
            CHECK (LEN(TRIM(TipoIdentificacionCode)) > 0
                    AND TipoIdentificacionCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'),

        CONSTRAINT CH_TiposIdentificacion_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
    CREATE TABLE Roles (
        RolCode VARCHAR(15) NOT NULL,
        NombreRol VARCHAR(75) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Roles
            PRIMARY KEY CLUSTERED (RolCode),

        CONSTRAINT UQ_Roles_NombreRol
            UNIQUE (NombreRol),

        CONSTRAINT CH_Roles_RolCode_Formato
            CHECK (LEN(TRIM(RolCode)) BETWEEN 1 AND 15
                    AND RolCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'),

        CONSTRAINT CH_Roles_NombreRol_NoVacio
            CHECK (LEN(TRIM(NombreRol)) > 0
                    AND NombreRol NOT LIKE ' %'
                    AND NombreRol NOT LIKE '% '
                    AND NombreRol NOT LIKE '%  %'),

        CONSTRAINT CH_Roles_NombreRol_SoloLetras
            CHECK (NombreRol NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%')
    );
GO

IF OBJECT_ID('dbo.Modulos', 'U') IS NULL
    CREATE TABLE Modulos (
        ModuloCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(75) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Modulos
            PRIMARY KEY CLUSTERED (ModuloCode),

        CONSTRAINT UQ_Modulos_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_Modulos_ModuloCode_Formato
            CHECK (LEN(TRIM(ModuloCode)) BETWEEN 1 AND 15
                    AND ModuloCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'),

        CONSTRAINT CH_Modulos_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %'),

        CONSTRAINT CH_Modulos_Nombre_SoloLetras
            CHECK (Nombre NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%')
    );
GO


/* ============================================================
   USUARIOS
   ============================================================ */
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
    CREATE TABLE Usuarios (
        UsuarioID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        RolCode VARCHAR(15) NOT NULL,
        TipoIdentificacionCode VARCHAR(15) NOT NULL,
        Identificacion VARCHAR(30) NOT NULL,
        NombreCompleto VARCHAR(175) NOT NULL,
        Email VARCHAR(150) NOT NULL,
        ContrasenaHash VARCHAR(500) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Usuarios
            PRIMARY KEY CLUSTERED (UsuarioID),

        CONSTRAINT FK_Usuarios_Rol
            FOREIGN KEY (RolCode) REFERENCES Roles(RolCode),

        CONSTRAINT FK_Usuarios_TipoIdentificacion
            FOREIGN KEY (TipoIdentificacionCode) REFERENCES TiposIdentificacion(TipoIdentificacionCode),

        CONSTRAINT UQ_Usuarios_Identificacion
            UNIQUE (Identificacion),

        CONSTRAINT UQ_Usuarios_Email
            UNIQUE (Email),

        CONSTRAINT CH_Usuarios_Identificacion_Formato
            CHECK (LEN(TRIM(Identificacion)) >= 9
                    AND Identificacion NOT LIKE ' %'
                    AND Identificacion NOT LIKE '% '
                    AND Identificacion NOT LIKE '% %'
                    AND Identificacion NOT LIKE '%[^A-Za-z0-9]%'),

        CONSTRAINT CH_Usuarios_NombreCompleto_NoVacio
            CHECK (LEN(TRIM(NombreCompleto)) > 0
                    AND NombreCompleto NOT LIKE ' %'
                    AND NombreCompleto NOT LIKE '% '
                    AND NombreCompleto NOT LIKE '%  %'),

        CONSTRAINT CH_Usuarios_NombreCompleto_SoloLetras
            CHECK (NombreCompleto NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%'),

        CONSTRAINT CH_Usuarios_Email_Formato
            CHECK (LEN(TRIM(Email)) >= 7
                    AND Email NOT LIKE ' %'
                    AND Email NOT LIKE '% '
                    AND Email NOT LIKE '% %'
                    AND Email LIKE '%_@_%._%'
                    AND Email NOT LIKE '%@%@%'
                    AND Email NOT LIKE '%..%'
                    AND Email NOT LIKE '%@.%'
                    AND Email NOT LIKE '[.@]%'
                    AND Email NOT LIKE '%[@.]'),

        CONSTRAINT CH_Usuarios_ContrasenaHash_NoVacio
            CHECK (LEN(TRIM(ContrasenaHash)) > 0
                    AND ContrasenaHash NOT LIKE ' %'
                    AND ContrasenaHash NOT LIKE '% '
                    AND ContrasenaHash NOT LIKE '%  %')
    );
GO


/* ============================================================
   PERMISOS POR ROL
   ============================================================ */
IF OBJECT_ID('dbo.RolesXModulos', 'U') IS NULL
    CREATE TABLE RolesXModulos (
        RolModuloID INT IDENTITY(1,1) NOT NULL,
        RolCode VARCHAR(15) NOT NULL,
        ModuloCode VARCHAR(15) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_RolesXModulos
            PRIMARY KEY CLUSTERED (RolModuloID),

        CONSTRAINT FK_RolesXModulos_Rol
            FOREIGN KEY (RolCode) REFERENCES Roles(RolCode),

        CONSTRAINT FK_RolesXModulos_Modulo
            FOREIGN KEY (ModuloCode) REFERENCES Modulos(ModuloCode),

        CONSTRAINT UQ_RolesXModulos_Rol_Modulo
            UNIQUE (RolCode, ModuloCode)
    );
GO


/* ============================================================
   SESIONES
   ============================================================ */
IF OBJECT_ID('dbo.RefreshToken', 'U') IS NULL
    CREATE TABLE RefreshToken (
        RefreshTokenID INT IDENTITY(1,1) NOT NULL,
        UsuarioID UNIQUEIDENTIFIER NOT NULL,
        TokenHash VARCHAR(500) NOT NULL,
        Revocado BIT NOT NULL DEFAULT 0,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        FechaExpiracion DATETIME2 NOT NULL,

        CONSTRAINT PK_RefreshToken
            PRIMARY KEY CLUSTERED (RefreshTokenID),

        CONSTRAINT FK_RefreshToken_Usuario
            FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),

        CONSTRAINT UQ_RefreshToken_TokenHash
            UNIQUE (TokenHash),

        CONSTRAINT CH_RefreshToken_TokenHash_NoVacio
            CHECK (LEN(TRIM(TokenHash)) > 0
                    AND TokenHash NOT LIKE ' %'
                    AND TokenHash NOT LIKE '% '
                    AND TokenHash NOT LIKE '%  %'),

        CONSTRAINT CH_RefreshToken_FechaExpiracion_Valida
            CHECK (FechaExpiracion > FechaCreacion)
    );
GO