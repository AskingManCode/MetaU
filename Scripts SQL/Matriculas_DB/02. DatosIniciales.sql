/* ============================================================
   DATOS INICIALES - Tablas Catálogos
   Base de datos: tiusr20pl_Matriculas_DB
   Microservicio: MAT3 - Expedientes
   ============================================================ */

USE tiusr20pl_Matriculas_DB;
GO

/* ============================================================
   Tipos de Identificación
   ============================================================ */
MERGE MetaU_DB_User.TiposIdentificacion AS destino
USING (VALUES
    ('CED', 'Cedula'),
    ('EXT', 'Extranjero'),
    ('PAS', 'Pasaporte')
) AS origen (TipoIdentificacionCode, Nombre)
ON destino.TipoIdentificacionCode = origen.TipoIdentificacionCode
WHEN MATCHED THEN
    UPDATE SET Nombre = origen.Nombre, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (TipoIdentificacionCode, Nombre, Estado)
    VALUES (origen.TipoIdentificacionCode, origen.Nombre, 1);
GO
