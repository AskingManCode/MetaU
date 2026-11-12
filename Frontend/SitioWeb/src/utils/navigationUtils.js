export function formatRole(roleCode) {
    if (!roleCode) return 'Usuario';
    const clean = String(roleCode).trim().toUpperCase();
    if (clean === 'ADM' || clean.includes('ADMIN')) return 'Administrador';
    if (clean === 'PROF' || clean.includes('PROF')) return 'Profesor';
    if (clean === 'EST' || clean.includes('ESTUD')) return 'Estudiante';
    if (clean === 'DIR') return 'Director';
    return String(roleCode);
}

const STATIC_ROUTES = [
    { path: '/', title: 'Dashboard', crumbs: [{ label: 'Inicio', to: '/' }], critical: false },
    { path: '/perfil', title: 'Mi Perfil', crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Mi Perfil' }], critical: false },
    { path: '/listados', title: 'Listados de Estudiantes', crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Evaluación' }, { label: 'Listados' }], critical: false },
    { path: '/historial', title: 'Historial Académico', crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Evaluación' }, { label: 'Historial' }], critical: false },
    { path: '/notas', title: 'Registro de Notas', crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Evaluación' }, { label: 'Notas' }], critical: true },
    { path: '/bitacoras', title: 'Bitácoras', crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Sistema' }, { label: 'Bitácoras' }], critical: true },
];

const CRUD_ENTITIES = [
    { section: 'Oferta Académica', base: '/instituciones', singular: 'Institución', critical: false },
    { section: 'Oferta Académica', base: '/carreras', title: 'Carreras', singular: 'Carrera', critical: false },
    { section: 'Oferta Académica', base: '/cursos', title: 'Cursos', singular: 'Curso', critical: false },
    { section: 'Oferta Académica', base: '/grupos', title: 'Grupos', singular: 'Grupo', critical: false },
    { section: 'Oferta Académica', base: '/periodos', title: 'Periodos', singular: 'Periodo', critical: false },
    { section: 'Personas', base: '/profesores', title: 'Profesores', singular: 'Profesor', critical: false },
    { section: 'Personas', base: '/expedientes', title: 'Expedientes', singular: 'Expediente', critical: false },
    { section: 'Matrícula', base: '/prematricula', title: 'Prematrícula', singular: 'Prematrícula', critical: true },
    { section: 'Matrícula', base: '/matricula', title: 'Matrícula', singular: 'Matrícula', critical: true },
    { section: 'Finanzas', base: '/facturas', title: 'Facturas', singular: 'Factura', critical: true },
    { section: 'Finanzas', base: '/pagos', title: 'Pagos', singular: 'Pago', critical: true },
    { section: 'Comunicación', base: '/notificaciones', title: 'Notificaciones', singular: 'Notificación', critical: false },
    { section: 'Sistema', base: '/usuarios', title: 'Usuarios', singular: 'Usuario', critical: true },
    { section: 'Sistema', base: '/roles', title: 'Roles', singular: 'Rol', critical: true },
    { section: 'Sistema', base: '/modulos', title: 'Módulos', singular: 'Módulo', critical: true },
    { section: 'Sistema', base: '/parametros', title: 'Parámetros', singular: 'Parámetro', critical: true },
];

export function getRouteInfo(pathname = '/') {
    const path = pathname.replace(/\/+$/, '') || '/';

    const staticMatch = STATIC_ROUTES.find((r) => r.path === path);
    if (staticMatch) {
        return {
            title: staticMatch.title,
            breadcrumbs: staticMatch.crumbs,
            isCritical: staticMatch.critical,
        };
    }

    if (path.startsWith('/roles/permisos/')) {
        return {
            title: 'Permisos del Rol',
            breadcrumbs: [{ label: 'Inicio', to: '/' }, { label: 'Sistema' }, { label: 'Roles', to: '/roles' }, { label: 'Permisos' }],
            isCritical: true,
        };
    }

    for (const entity of CRUD_ENTITIES) {
        if (path === entity.base) {
            return {
                title: entity.title,
                breadcrumbs: [{ label: 'Inicio', to: '/' }, { label: entity.section }, { label: entity.title }],
                isCritical: entity.critical,
            };
        }
        if (path === `${entity.base}/nuevo`) {
            return {
                title: `Crear ${entity.singular}`,
                breadcrumbs: [{ label: 'Inicio', to: '/' }, { label: entity.section }, { label: entity.title, to: entity.base }, { label: 'Nuevo' }],
                isCritical: entity.critical,
            };
        }
        if (path.startsWith(`${entity.base}/editar/`)) {
            return {
                title: `Editar ${entity.singular}`,
                breadcrumbs: [{ label: 'Inicio', to: '/' }, { label: entity.section }, { label: entity.title, to: entity.base }, { label: 'Editar' }],
                isCritical: entity.critical,
            };
        }
        if (path.startsWith(`${entity.base}/ver/`)) {
            return {
                title: `Detalle de ${entity.singular}`,
                breadcrumbs: [{ label: 'Inicio', to: '/' }, { label: entity.section }, { label: entity.title, to: entity.base }, { label: 'Detalle' }],
                isCritical: entity.critical,
            };
        }
    }

    const segments = path.split('/').filter(Boolean);
    const crumbs = [{ label: 'Inicio', to: '/' }];
    let accumulated = '';
    for (let i = 0; i < segments.length; i++) {
        const seg = decodeURIComponent(segments[i]);
        accumulated += `/${seg}`;
        const name = seg.charAt(0).toUpperCase() + seg.slice(1);
        crumbs.push(i === segments.length - 1 ? { label: name } : { label: name, to: accumulated });
    }

    const lastSeg = segments[segments.length - 1] || 'Inicio';
    const fallbackTitle = decodeURIComponent(lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1));

    return {
        title: fallbackTitle,
        breadcrumbs: crumbs,
        isCritical: false,
    };
}
