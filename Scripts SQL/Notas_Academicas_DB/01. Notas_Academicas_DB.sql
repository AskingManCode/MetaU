/* ============================================================
   BASE DE DATOS: Notas_Academicas_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Notas_Academicas_DB') IS NULL
BEGIN
    CREATE DATABASE Notas_Academicas_DB;
END
GO

USE Notas_Academicas_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */


/* ============================================================
   RUBROS DE EVALUACIÓN
   ============================================================ */
IF OBJECT_ID('dbo.Rubros', 'U') IS NULL
    CREATE TABLE Rubros (
        RubroID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        GrupoCode VARCHAR(15) NOT NULL, -- REF: Oferta_Academica_DB.Grupos
        NombreRubro VARCHAR(100) NOT NULL,
        Porcentaje DECIMAL(5,2) NOT NULL,
        Bloqueado BIT NOT NULL DEFAULT 1,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Rubros
            PRIMARY KEY CLUSTERED (RubroID),

        CONSTRAINT UQ_Rubros_GrupoCode_NombreRubro
            UNIQUE (GrupoCode, NombreRubro),

        CONSTRAINT CH_Rubros_GrupoCode_Formato
            CHECK (LEN(TRIM(GrupoCode)) BETWEEN 1 AND 15
                    AND GrupoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_Rubros_NombreRubro_NoVacio
            CHECK (LEN(TRIM(NombreRubro)) > 0
                    AND NombreRubro NOT LIKE ' %'
                    AND NombreRubro NOT LIKE '% '
                    AND NombreRubro NOT LIKE '%  %'),

        CONSTRAINT CH_Rubros_Porcentaje
            CHECK (Porcentaje > 0 AND Porcentaje <= 100)
    );
GO


/* ============================================================
   NOTAS DE ESTUDIANTES
   ============================================================ */
IF OBJECT_ID('dbo.NotasXEstudiante', 'U') IS NULL
    CREATE TABLE NotasXEstudiante (
        NotaXEstudianteID INT IDENTITY(1,1) NOT NULL,
        RubroID UNIQUEIDENTIFIER NOT NULL,
        EstudianteID UNIQUEIDENTIFIER NOT NULL, -- REF: Matriculas_DB.Estudiantes
        Nota DECIMAL(5,2) NOT NULL,
        FechaRegistro DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),

        CONSTRAINT PK_NotasXEstudiante
            PRIMARY KEY CLUSTERED (NotaXEstudianteID),

        CONSTRAINT FK_NotasXEstudiante_Rubro
            FOREIGN KEY (RubroID) REFERENCES Rubros(RubroID),

        CONSTRAINT UQ_NotasXEstudiante_Rubro_Estudiante
            UNIQUE (RubroID, EstudianteID),

        CONSTRAINT CH_NotasXEstudiante_Nota
            CHECK (Nota BETWEEN 1 AND 100),

        CONSTRAINT CH_NotasXEstudiante_FechaRegistro
            CHECK (FechaRegistro <= CAST(GETDATE() AS DATE))
    );
GO

IF OBJECT_ID('dbo.NotasFinales', 'U') IS NULL
    CREATE TABLE NotasFinales (
        NotasFinalesID INT IDENTITY(1,1) NOT NULL,
        CursoCode VARCHAR(15) NOT NULL, -- REF: Oferta_Academica_DB.Cursos
        PeriodoID UNIQUEIDENTIFIER NOT NULL, -- REF: Oferta_Academica_DB.Periodos
        EstudianteID UNIQUEIDENTIFIER NOT NULL, -- REF: Matriculas_DB.Estudiantes
        Promedio DECIMAL(5,2) NOT NULL,

        CONSTRAINT PK_NotasFinales
            PRIMARY KEY CLUSTERED (NotasFinalesID),

        CONSTRAINT UQ_NotasFinales_Curso_Periodo_Estudiante
            UNIQUE (CursoCode, PeriodoID, EstudianteID),

        CONSTRAINT CH_NotasFinales_CursoCode_Formato
            CHECK (LEN(TRIM(CursoCode)) BETWEEN 1 AND 15
                    AND CursoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z0-9]%'),

        CONSTRAINT CH_NotasFinales_Promedio
            CHECK (Promedio >= 0 AND Promedio <= 100)
    );
GO