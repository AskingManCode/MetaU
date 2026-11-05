/* ============================================================
   DATOS INICIALES - Tablas Catálogos de Seguridad
   Base de datos: tiusr20pl_Usuarios_DB
   ============================================================ */

USE tiusr20pl_Usuarios_DB;
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

/* ============================================================
   Roles (Estudiante, Profesor, Administrativo)
   ============================================================ */
MERGE MetaU_DB_User.Roles AS destino
USING (VALUES
    ('EST', 'Estudiante'),
    ('PROF', 'Profesor'),
    ('ADM', 'Administrativo')
) AS origen (RolCode, NombreRol)
ON destino.RolCode = origen.RolCode
WHEN MATCHED THEN
    UPDATE SET NombreRol = origen.NombreRol, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (RolCode, NombreRol, Estado) 
    VALUES (origen.RolCode, origen.NombreRol, 1);
GO

/* ============================================================
   Módulos del Sistema (Pendiente de agregar)
   ============================================================ */
/*MERGE MetaU_DB_User.Modulos AS destino
USING (VALUES
    ('SEG', 'Seguridad'),
    ('USR', 'Usuarios'),
    ('ACAD', 'Academico'),
    ('MAT', 'Matricula')
) AS origen (ModuloCode, Nombre)
ON destino.ModuloCode = origen.ModuloCode
WHEN MATCHED THEN
    UPDATE SET Nombre = origen.Nombre, Estado = 1
WHEN NOT MATCHED THEN
    INSERT (ModuloCode, Nombre, Estado) 
    VALUES (origen.ModuloCode, origen.Nombre, 1);
GO*/