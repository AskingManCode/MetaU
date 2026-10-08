USE Oferta_Academica_DB;
GO

CREATE TYPE dbo.TelefonoProfesorType AS TABLE
(
    Telefono VARCHAR(30) NOT NULL
);
GO