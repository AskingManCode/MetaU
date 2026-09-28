/* ============================================================
   BASE DE DATOS: Matriculas_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Matriculas_DB') IS NULL
BEGIN
    CREATE DATABASE Matriculas_DB;
END
GO

USE Matriculas_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */

/* 
    Otras Notas:
    MAT1: “Deben ser cursos de primer nivel” -> validar contra Oferta_Academica_DB.Cursos.Nivel = 1.
    MAT1: “Solo se pueden prematricular periodos futuros” -> validar contra Oferta_Academica_DB.Periodos.FechaInicio > hoy.
    MAT2: “Solo se pueden matricular periodos activos” -> validar contra el periodo correspondiente.
    MAT3: “Mayor de edad” (aplica a profesores, no estudiantes según los requerimientos).
    MAT3: “Email debe pertenecer al dominio parametrizable”.
    MAT2: “El grupo pertenece al curso” y “hay cupo disponible”.
*/

/* ============================================================
   CATÁLOGOS DE IDENTIFICACIÓN
   ============================================================ */
IF OBJECT_ID('dbo.TiposIdentificacion', 'U') IS NULL
    CREATE TABLE TiposIdentificacion (
        TipoIdentificacionCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(75) NOT NULL, --- Residente, Nacional, Pasaporte
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_TiposIdentificacion
            PRIMARY KEY CLUSTERED (TipoIdentificacionCode),

        CONSTRAINT UQ_TiposIdentificacion_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_TiposIdentificacion_TipoIdentificacionCode_Formato
            CHECK (LEN(TRIM(TipoIdentificacionCode)) > 0
                    AND TipoIdentificacionCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'),

        CONSTRAINT CH_TiposIdentificacion_Formato
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO


/* ============================================================
   ESTUDIANTES
   ============================================================ */
IF OBJECT_ID('dbo.Estudiantes', 'U') IS NULL
    CREATE TABLE Estudiantes (
        EstudianteID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        UsuarioID UNIQUEIDENTIFIER NOT NULL, -- REF: Usuarios_DB.Usuarios
        TipoIdentificacionCode VARCHAR(15) NOT NULL,
        Identificacion VARCHAR(30) NOT NULL,
        NombreCompleto VARCHAR(175) NOT NULL,
        Email VARCHAR(150) NOT NULL,
        FechaNacimiento DATE NOT NULL,
        ProvinciaID UNIQUEIDENTIFIER NOT NULL, -- REF: Ubicaciones_DB.Provincias
        CantonID UNIQUEIDENTIFIER NOT NULL, -- REF: Ubicaciones_DB.Cantones
        DistritoID UNIQUEIDENTIFIER NOT NULL, -- REF: Ubicaciones_DB.Distritos
        Direccion VARCHAR(250) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Estudiantes
            PRIMARY KEY CLUSTERED (EstudianteID),

        CONSTRAINT FK_Estudiantes_TipoIdentificacion
            FOREIGN KEY (TipoIdentificacionCode) REFERENCES TiposIdentificacion(TipoIdentificacionCode),

        CONSTRAINT UQ_Estudiantes_UsuarioID
            UNIQUE (UsuarioID),

        CONSTRAINT UQ_Estudiantes_Identificacion
            UNIQUE (Identificacion),

        CONSTRAINT UQ_Estudiantes_Email
            UNIQUE (Email),

        CONSTRAINT CH_Estudiantes_Identificacion_Formato
            CHECK (LEN(TRIM(Identificacion)) >= 9
                    AND Identificacion NOT LIKE ' %'
                    AND Identificacion NOT LIKE '% '
                    AND Identificacion NOT LIKE '% %'
                    AND Identificacion NOT LIKE '%[^A-Za-z0-9]%'),

        CONSTRAINT CH_Estudiantes_NombreCompleto_NoVacio
            CHECK (LEN(TRIM(NombreCompleto)) > 0
                    AND NombreCompleto NOT LIKE ' %'
                    AND NombreCompleto NOT LIKE '% '
                    AND NombreCompleto NOT LIKE '%  %'),

        CONSTRAINT CH_Estudiantes_NombreCompleto_SoloLetras
            CHECK (NombreCompleto NOT LIKE '%[^A-Za-zÁÉÍÓÚáéíóúÑñ ]%'),

        CONSTRAINT CH_Estudiantes_Email_Formato
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

        CONSTRAINT CH_Estudiantes_FechaNacimiento
            CHECK (FechaNacimiento <= CAST(GETDATE() AS DATE)),

        CONSTRAINT CH_Estudiantes_Direccion_NoVacio
            CHECK (LEN(TRIM(Direccion)) > 0
                    AND Direccion NOT LIKE ' %'
                    AND Direccion NOT LIKE '% '
                    AND Direccion NOT LIKE '%  %')
    );
GO

IF OBJECT_ID('dbo.TelefonosXEstudiantes', 'U') IS NULL
    CREATE TABLE TelefonosXEstudiantes (
        TelefonoXEstudiante INT IDENTITY(1,1) NOT NULL,
        EstudianteID UNIQUEIDENTIFIER NOT NULL,
        Telefono VARCHAR(25) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_TelefonosXEstudiantes
            PRIMARY KEY CLUSTERED (TelefonoXEstudiante),

        CONSTRAINT FK_TelefonosXEstudiantes_Estudiante
            FOREIGN KEY (EstudianteID) REFERENCES Estudiantes(EstudianteID),

        CONSTRAINT UQ_TelefonosXEstudiantes_EstudianteID_Telefono
            UNIQUE (EstudianteID, Telefono),

        CONSTRAINT CH_TelefonosXEstudiantes_Telefono_Formato
            CHECK (LEN(TRIM(Telefono)) >= 8
                    AND Telefono NOT LIKE ' %'
                    AND Telefono NOT LIKE '% '
                    AND Telefono NOT LIKE '% %'
                    AND Telefono NOT LIKE '%[^0-9]%')
    );
GO


/* ============================================================
   PREMATRÍCULAS
   ============================================================ */
IF OBJECT_ID('dbo.PreMatriculas', 'U') IS NULL
    CREATE TABLE PreMatriculas (
        PreMatriculaID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        EstudianteID UNIQUEIDENTIFIER NOT NULL,
        CarreraCode VARCHAR(15) NOT NULL, -- REF: Oferta_Academica_DB.Carreras
        PeriodoID UNIQUEIDENTIFIER NOT NULL, -- REF: Oferta_Academica_DB.Periodos
        Observaciones VARCHAR(300) NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_PreMatriculas
            PRIMARY KEY CLUSTERED (PreMatriculaID),

        CONSTRAINT FK_PreMatriculas_Estudiante
            FOREIGN KEY (EstudianteID) REFERENCES Estudiantes(EstudianteID),

        CONSTRAINT UQ_PreMatriculas_Estudiante_Carrera_Periodo
            UNIQUE (EstudianteID, CarreraCode, PeriodoID),

        CONSTRAINT CH_PreMatriculas_CarreraCode_Formato
            CHECK (LEN(TRIM(CarreraCode)) BETWEEN 1 AND 15
                    AND CarreraCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_PreMatriculas_Observaciones_NoVacio
            CHECK (Observaciones IS NULL
                    OR (LEN(TRIM(Observaciones)) > 0
                        AND Observaciones NOT LIKE ' %'
                        AND Observaciones NOT LIKE '% '
                        AND Observaciones NOT LIKE '%  %'))
    );
GO

IF OBJECT_ID('dbo.PreMatriculasXCursos', 'U') IS NULL
    CREATE TABLE PreMatriculasXCursos (
        PreMatriculaXCurso INT IDENTITY(1,1) NOT NULL,
        PreMatriculaID UNIQUEIDENTIFIER NOT NULL,
        CursoCode VARCHAR(15) NOT NULL, -- REF: Oferta_Academica_DB.Cursos
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_PreMatriculasXCursos
            PRIMARY KEY CLUSTERED (PreMatriculaXCurso),

        CONSTRAINT FK_PreMatriculasXCursos_PreMatricula
            FOREIGN KEY (PreMatriculaID) REFERENCES PreMatriculas(PreMatriculaID),

        CONSTRAINT UQ_PreMatriculasXCursos_PreMatricula_Curso
            UNIQUE (PreMatriculaID, CursoCode),

        CONSTRAINT CH_PreMatriculasXCursos_CursoCode_Formato
            CHECK (LEN(TRIM(CursoCode)) BETWEEN 1 AND 15
                    AND CursoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%')
    );
GO


/* ============================================================
   MATRÍCULAS
   ============================================================ */
IF OBJECT_ID('dbo.Matriculas', 'U') IS NULL
    CREATE TABLE Matriculas (
        MatriculaID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        EstudianteID UNIQUEIDENTIFIER NOT NULL,
        CarreraCode VARCHAR(15) NOT NULL, -- REF: Oferta_Academica_DB.Carreras
        PeriodoID UNIQUEIDENTIFIER NOT NULL, -- REF: Oferta_Academica_DB.Periodos
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Matriculas
            PRIMARY KEY CLUSTERED (MatriculaID),

        CONSTRAINT FK_Matriculas_Estudiante
            FOREIGN KEY (EstudianteID) REFERENCES Estudiantes(EstudianteID),

        CONSTRAINT UQ_Matriculas_Estudiante_Carrera_Periodo
            UNIQUE (EstudianteID, CarreraCode, PeriodoID),

        CONSTRAINT CH_Matriculas_CarreraCode_Formato
            CHECK (LEN(TRIM(CarreraCode)) BETWEEN 1 AND 15
                AND CarreraCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%')
    );
GO

IF OBJECT_ID('dbo.MatriculasXCursos', 'U') IS NULL
    CREATE TABLE MatriculasXCursos (
        MatriculaXCurso INT IDENTITY(1,1) NOT NULL,
        MatriculaID UNIQUEIDENTIFIER NOT NULL,
        CursoCode VARCHAR(15) NOT NULL, -- REF: Oferta_Academica_DB.Cursos
        GrupoCode VARCHAR(15) NOT NULL, -- REF: Oferta_Academica_DB.Grupos
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_MatriculasXCursos
            PRIMARY KEY CLUSTERED (MatriculaXCurso),

        CONSTRAINT FK_MatriculasXCursos_Matricula
            FOREIGN KEY (MatriculaID) REFERENCES Matriculas(MatriculaID),

        CONSTRAINT UQ_MatriculasXCursos_Matricula_Curso
            UNIQUE (MatriculaID, CursoCode),

        CONSTRAINT CH_MatriculasXCursos_CursoCode_NoVacio
            CHECK (LEN(TRIM(CursoCode)) BETWEEN 1 AND 15
                AND CursoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_MatriculasXCursos_GrupoCode_NoVacio
            CHECK (LEN(TRIM(GrupoCode)) BETWEEN 1 AND 15 
                AND GrupoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%')
    );
GO