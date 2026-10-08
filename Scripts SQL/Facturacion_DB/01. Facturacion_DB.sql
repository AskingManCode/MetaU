/* ============================================================
   BASE DE DATOS: Facturacion_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Facturacion_DB') IS NULL
BEGIN
    CREATE DATABASE Facturacion_DB;
END
GO

USE Facturacion_DB;
GO

/* NOTA: las columnas marcadas como REF en el diagrama apuntan a tablas de otras
   bases de datos. SQL Server no permite FOREIGN KEY entre bases de datos, por lo
   que se documentan con un comentario en línea (-- REF: Base.Tabla) y su
   integridad debe validarse desde la capa de aplicación. */


/* ============================================================
   CATÁLOGOS DE FACTURACIÓN
   ============================================================ */
IF OBJECT_ID('dbo.EstadosFacturas', 'U') IS NULL
    CREATE TABLE EstadosFacturas (
        EstadoFacturaCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(75) NOT NULL, --- Pendiente, Pagada, Anulada
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_EstadosFacturas
            PRIMARY KEY CLUSTERED (EstadoFacturaCode),

        CONSTRAINT UQ_EstadosFacturas_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_EstadosFacturas_EstadoFacturaCode_Formato
            CHECK (
                LEN(EstadoFacturaCode) BETWEEN 1 AND 15
                AND EstadoFacturaCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'
            ),

        CONSTRAINT CH_EstadosFacturas_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO


/* ============================================================
   FACTURAS Y DETALLES
   ============================================================ */
IF OBJECT_ID('dbo.Facturas', 'U') IS NULL
    CREATE TABLE Facturas (
        FacturaID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        EstudianteID UNIQUEIDENTIFIER NOT NULL, -- REF: Matriculas_DB.Estudiantes
        MatriculaID UNIQUEIDENTIFIER NOT NULL, -- REF: Matriculas_DB.Matriculas
        PeriodoID UNIQUEIDENTIFIER NOT NULL, -- REF: Oferta_Academica_DB.Periodos
        EstadoFacturaCode VARCHAR(15) NOT NULL,
        FechaEmision DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        FechaAnulacion DATETIME2 NULL, -- Se llena cuando la factura pasa a estado Anulada, para mantener auditoría
        Subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
        PorcentajeImpuesto DECIMAL(5,2) NOT NULL DEFAULT 2,
        Impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
        Total DECIMAL(12,2) NOT NULL DEFAULT 0,

        CONSTRAINT PK_Facturas
            PRIMARY KEY CLUSTERED (FacturaID),

        CONSTRAINT FK_Facturas_EstadoFactura
            FOREIGN KEY (EstadoFacturaCode)
            REFERENCES EstadosFacturas(EstadoFacturaCode),

        CONSTRAINT CH_Facturas_Subtotal
            CHECK (Subtotal >= 0),

        CONSTRAINT CH_Facturas_PorcentajeImpuesto
            CHECK (PorcentajeImpuesto >= 0 AND PorcentajeImpuesto <= 100),

        CONSTRAINT CH_Facturas_Impuesto
            CHECK (Impuesto >= 0),

        CONSTRAINT CH_Facturas_Total
            CHECK (Total >= 0),

        CONSTRAINT CH_Facturas_TotalCalculado
            CHECK (Total = Subtotal + Impuesto),

        CONSTRAINT CH_Facturas_ImpuestoCalculado
            CHECK (Impuesto = ROUND(Subtotal * PorcentajeImpuesto / 100, 2)),

        CONSTRAINT CH_Facturas_FechaAnulacion
            CHECK ((EstadoFacturaCode = 'ANU' AND FechaAnulacion IS NOT NULL) OR (EstadoFacturaCode <> 'ANU' AND FechaAnulacion IS NULL))
    );
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_Facturas_MatriculaID'
      AND object_id = OBJECT_ID('dbo.Facturas')
)
    CREATE UNIQUE INDEX UX_Facturas_MatriculaID
        ON dbo.Facturas (MatriculaID);
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Facturas_PeriodoID_FechaEmision'
      AND object_id = OBJECT_ID('dbo.Facturas')
)
    CREATE INDEX IX_Facturas_PeriodoID_FechaEmision
        ON dbo.Facturas (PeriodoID, FechaEmision);
GO

IF OBJECT_ID('dbo.DetallesFacturas', 'U') IS NULL
    CREATE TABLE DetallesFacturas (
        DetalleFacturaID INT IDENTITY(1,1) NOT NULL,
        FacturaID UNIQUEIDENTIFIER NOT NULL,
        Descripcion VARCHAR(150) NOT NULL,
        CursoCode VARCHAR(15) NULL, -- REF: Oferta_Academica_DB.Cursos
        Monto DECIMAL(12,2) NOT NULL,

        CONSTRAINT PK_DetallesFacturas
            PRIMARY KEY CLUSTERED (DetalleFacturaID),

        CONSTRAINT FK_DetallesFacturas_Factura
            FOREIGN KEY (FacturaID)
            REFERENCES Facturas(FacturaID),

        CONSTRAINT CH_DetallesFacturas_Descripcion_NoVacio
            CHECK (LEN(TRIM(Descripcion)) > 0
                    AND Descripcion NOT LIKE ' %'
                    AND Descripcion NOT LIKE '% '
                    AND Descripcion NOT LIKE '%  %'),

        CONSTRAINT CH_DetallesFacturas_CursoCode_NoVacio
            CHECK (CursoCode IS NULL
                    OR (LEN(TRIM(CursoCode)) > 0
                        AND CursoCode NOT LIKE ' %'
                        AND CursoCode NOT LIKE '% '
                        AND CursoCode NOT LIKE '%  %')),

        CONSTRAINT CH_DetallesFacturas_Monto
            CHECK (Monto >= 0)
    );
GO


/* ============================================================
   CATÁLOGOS DE PAGOS
   ============================================================ */
IF OBJECT_ID('dbo.EstadosPagos', 'U') IS NULL
    CREATE TABLE EstadosPagos (
        EstadoPagoCode VARCHAR(15) NOT NULL,
        Nombre VARCHAR(75) NOT NULL, --- Activo, Reversado
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_EstadosPagos
            PRIMARY KEY CLUSTERED (EstadoPagoCode),

        CONSTRAINT UQ_EstadosPagos_Nombre
            UNIQUE (Nombre),

        CONSTRAINT CH_EstadosPagos_EstadoPagoCode_Formato
            CHECK (
                LEN(EstadoPagoCode) BETWEEN 1 AND 15
                AND EstadoPagoCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'
            ),

        CONSTRAINT CH_EstadosPagos_Nombre_NoVacio
            CHECK (LEN(TRIM(Nombre)) > 0
                    AND Nombre NOT LIKE ' %'
                    AND Nombre NOT LIKE '% '
                    AND Nombre NOT LIKE '%  %')
    );
GO


/* ============================================================
   PAGOS
   ============================================================ */
IF OBJECT_ID('dbo.Pagos', 'U') IS NULL
    CREATE TABLE Pagos (
        PagoID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
        FacturaID UNIQUEIDENTIFIER NOT NULL,
        Monto DECIMAL(12,2) NOT NULL,
        FechaPago DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        FechaReversion DATETIME2 NULL, -- Se llena cuando el pago se reversa, para mantener auditoria
        EstadoPagoCode VARCHAR(15) NOT NULL,

        CONSTRAINT PK_Pagos
            PRIMARY KEY CLUSTERED (PagoID),

        CONSTRAINT FK_Pagos_Factura
            FOREIGN KEY (FacturaID)
            REFERENCES Facturas(FacturaID),

        CONSTRAINT FK_Pagos_EstadoPago
            FOREIGN KEY (EstadoPagoCode)
            REFERENCES EstadosPagos(EstadoPagoCode),

        CONSTRAINT CH_Pagos_Monto
            CHECK (Monto > 0),
        
        CONSTRAINT CH_Pagos_FechaReversion
            CHECK ((EstadoPagoCode = 'REV' AND FechaReversion IS NOT NULL) OR
                (EstadoPagoCode <> 'REV' AND FechaReversion IS NULL))
    );
GO