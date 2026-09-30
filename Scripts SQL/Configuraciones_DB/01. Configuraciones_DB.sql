/* ============================================================
   BASE DE DATOS: Configuraciones_DB
   Script de creación de estructura de tablas y relaciones
   ============================================================ */

IF DB_ID('Configuraciones_DB') IS NULL
BEGIN
    CREATE DATABASE Configuraciones_DB;
END
GO

USE Configuraciones_DB;
GO


/* ============================================================
   1. PARÁMETROS DEL SISTEMA
   ============================================================ */
IF OBJECT_ID('dbo.Parametros', 'U') IS NULL
    CREATE TABLE Parametros (
        ParametroCode VARCHAR(10) NOT NULL,
        Valor VARCHAR(500) NOT NULL,
        Estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT PK_Parametros
            PRIMARY KEY CLUSTERED (ParametroCode),

        CONSTRAINT CH_Parametros_ParametroCode_Formato
            CHECK (
                LEN(ParametroCode) BETWEEN 1 AND 10
                AND ParametroCode COLLATE Latin1_General_BIN NOT LIKE '%[^A-Z]%'
            ),

        CONSTRAINT CH_Parametros_Valor_NoVacio
            CHECK (LEN(TRIM(Valor)) > 0
                    AND Valor NOT LIKE ' %'
                    AND Valor NOT LIKE '% '
                    AND Valor NOT LIKE '%  %')
    );
GO