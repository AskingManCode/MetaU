/* ============================================================
   BASE DE DATOS: Oferta_Academica_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Oferta_Academica_DB') IS NULL
BEGIN
    CREATE DATABASE Oferta_Academica_DB;
END
GO

USE Oferta_Academica_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */


/* ============================================================
   CATÁLOGOS
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

IF OBJECT_ID('dbo.Instituciones', 'U') IS NULL
    CREATE TABLE Instituciones (
        InstitucionCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(150) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Instituciones
            PRIMARY KEY CLUSTERED (InstitucionCode),

        CONSTRAINT UQ_Instituciones_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_Instituciones_InstitucionCode_Formato
            CHECK (LEN(TRIM(InstitucionCode)) > 0
                    AND InstitucionCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_Instituciones_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %'),

        CONSTRAINT CH_Instituciones_Nombre_SoloLetras
            CHECK (Nombre NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%')
    );
GO

IF OBJECT_ID('dbo.Periodos', 'U') IS NULL
    CREATE TABLE Periodos (
        PeriodoID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        NumeroPeriodo INT NOT NULL,
        FechaInicio DATE NOT NULL,
        FechaFin DATE NOT NULL,
        Anio SMALLINT NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Periodos
            PRIMARY KEY CLUSTERED (PeriodoID),

        CONSTRAINT UQ_Periodos_Anio_NumeroPeriodo
            UNIQUE (Anio, NumeroPeriodo),

        CONSTRAINT CH_Periodos_NumeroPeriodo
            CHECK (NumeroPeriodo > 0),

        CONSTRAINT CH_Periodos_Anio
            CHECK (Anio >= 1976), -- Anio fundacion del CUC

        CONSTRAINT CH_Periodos_Fechas
            CHECK (FechaFin > FechaInicio)
    );
GO


/* ============================================================
   PROFESORES
   ============================================================ */
IF OBJECT_ID('dbo.Profesores', 'U') IS NULL
    CREATE TABLE Profesores (
        ProfesorID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        UsuarioID UNIQUEIDENTIFIER NULL, -- REF: Usuarios_DB.Usuarios
        TipoIdentificacionCode VARCHAR(15) NOT NULL,
        Identificacion VARCHAR(30) NOT NULL,
        Email VARCHAR(150) NOT NULL,
        NombreCompleto VARCHAR(175) NOT NULL,
        FechaNacimiento DATE NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Profesores
            PRIMARY KEY CLUSTERED (ProfesorID),

        CONSTRAINT FK_Profesores_TipoIdentificacion
            FOREIGN KEY (TipoIdentificacionCode) 
            REFERENCES TiposIdentificacion(TipoIdentificacionCode),

        CONSTRAINT UQ_Profesores_Identificacion
            UNIQUE (Identificacion),

        CONSTRAINT UQ_Profesores_Email
            UNIQUE (Email),

        CONSTRAINT CH_Profesores_Identificacion_Formato
            CHECK (LEN(TRIM(Identificacion)) >= 9
                    AND Identificacion NOT LIKE ' %'
                    AND Identificacion NOT LIKE '% '
                    AND Identificacion NOT LIKE '% %'
                    AND Identificacion NOT LIKE '%[^A-Za-z0-9]%'),

        CONSTRAINT CH_Profesores_Email_Formato
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

        CONSTRAINT CH_Profesores_NombreCompleto_NoVacio
            CHECK (LEN(TRIM(NombreCompleto)) > 0
                    AND NombreCompleto NOT LIKE ' %'
                    AND NombreCompleto NOT LIKE '% '
                    AND NombreCompleto NOT LIKE '%  %'),

        CONSTRAINT CH_Profesores_NombreCompleto_SoloLetras
            CHECK (NombreCompleto NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%'),

        CONSTRAINT CH_Profesores_MayorEdad
            CHECK (FechaNacimiento <= DATEADD(YEAR, -18, CAST(GETDATE() AS DATE)))
    );
GO

IF OBJECT_ID('dbo.TelefonosXProfesores', 'U') IS NULL
    CREATE TABLE TelefonosXProfesores (
        TelefonoXProfesor INT IDENTITY(1,1) NOT NULL,
        ProfesorID UNIQUEIDENTIFIER NOT NULL,
        Telefono VARCHAR(25) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_TelefonosXProfesores
            PRIMARY KEY CLUSTERED (TelefonoXProfesor),

        CONSTRAINT FK_TelefonosXProfesores_Profesor
            FOREIGN KEY (ProfesorID) REFERENCES Profesores(ProfesorID),

        CONSTRAINT UQ_TelefonosXProfesores_ProfesorID_Telefono
            UNIQUE (ProfesorID, Telefono),

        CONSTRAINT CH_TelefonosXProfesores_Telefono_Formato
            CHECK (LEN(TRIM(Telefono)) >= 8
                    AND Telefono NOT LIKE ' %'
                    AND Telefono NOT LIKE '% '
                    AND Telefono NOT LIKE '% %'
                    AND Telefono NOT LIKE '%[^0-9]%')
    );
GO


/* ============================================================
   CARRERAS Y CURSOS
   ============================================================ */
IF OBJECT_ID('dbo.Carreras', 'U') IS NULL
    CREATE TABLE Carreras (
        CarreraCode VARCHAR(15) NOT NULL,
        InstitucionCode VARCHAR(15) NOT NULL,
        DirectorID UNIQUEIDENTIFIER NOT NULL,
        Nombre VARCHAR(150) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Carreras
            PRIMARY KEY CLUSTERED (CarreraCode),

        CONSTRAINT FK_Carreras_Institucion
            FOREIGN KEY (InstitucionCode) REFERENCES Instituciones(InstitucionCode),

        CONSTRAINT FK_Carreras_Director
            FOREIGN KEY (DirectorID) REFERENCES Profesores(ProfesorID),

        CONSTRAINT UQ_Carreras_Institucion_Nombre
            UNIQUE (InstitucionCode, Nombre),

        CONSTRAINT CH_Carreras_CarreraCode_Formato
            CHECK (LEN(TRIM(CarreraCode)) BETWEEN 1 AND 15
                    AND CarreraCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_Carreras_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %'),

        CONSTRAINT CH_Carreras_Nombre_SoloLetras
            CHECK (Nombre NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%')
    );
GO

IF OBJECT_ID('dbo.Cursos', 'U') IS NULL
    CREATE TABLE Cursos (
        CursoCode VARCHAR(15) NOT NULL,
        CarreraCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(150) NOT NULL,
        Nivel TINYINT NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Cursos
            PRIMARY KEY CLUSTERED (CursoCode),

        CONSTRAINT FK_Cursos_Carrera
            FOREIGN KEY (CarreraCode) REFERENCES Carreras(CarreraCode),

        CONSTRAINT UQ_Cursos_Carrera_Nombre
            UNIQUE (CarreraCode, Nombre),

        CONSTRAINT CH_Cursos_CursoCode_Formato
            CHECK (LEN(TRIM(CursoCode)) BETWEEN 1 AND 15
                    AND CursoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_Cursos_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %'),

        CONSTRAINT CH_Cursos_Nombre_SoloLetras
            CHECK (Nombre NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%'),

        CONSTRAINT CH_Cursos_Nivel
            CHECK (Nivel BETWEEN 1 AND 12)
    );
GO


/* ============================================================
   GRUPOS
   ============================================================ */
IF OBJECT_ID('dbo.Grupos', 'U') IS NULL
    CREATE TABLE Grupos (
        GrupoCode VARCHAR(15) NOT NULL,
        CursoCode VARCHAR(15) NOT NULL,
        PeriodoID UNIQUEIDENTIFIER NOT NULL,
        ProfesorID UNIQUEIDENTIFIER NOT NULL,
        NumeroGrupo TINYINT NOT NULL,
        Horario VARCHAR(30) NOT NULL,
        Cupo INT NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Grupos
            PRIMARY KEY CLUSTERED (GrupoCode),

        CONSTRAINT FK_Grupos_Curso
            FOREIGN KEY (CursoCode) REFERENCES Cursos(CursoCode),

        CONSTRAINT FK_Grupos_Periodo
            FOREIGN KEY (PeriodoID) REFERENCES Periodos(PeriodoID),

        CONSTRAINT FK_Grupos_Profesor
            FOREIGN KEY (ProfesorID) REFERENCES Profesores(ProfesorID),

        CONSTRAINT UQ_Grupos_Curso_Periodo_NumeroGrupo
            UNIQUE (CursoCode, PeriodoID, NumeroGrupo),

        CONSTRAINT CH_Grupos_GrupoCode_Formato
            CHECK (LEN(TRIM(GrupoCode)) BETWEEN 1 AND 15
                    AND GrupoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_Grupos_NumeroGrupo
            CHECK (NumeroGrupo > 0),

        CONSTRAINT CH_Grupos_Horario_NoVacio
            CHECK (LEN(TRIM(Horario)) > 0
                    AND Horario NOT LIKE ' %'
                    AND Horario NOT LIKE '% '
                    AND Horario NOT LIKE '%  %'),

        CONSTRAINT CH_Grupos_Cupo
            CHECK (Cupo > 0)
    );
GO