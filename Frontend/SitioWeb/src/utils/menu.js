export const BASE_MENU = [
    { label: 'Dashboard', icon: 'bi-house-door', to: '/', end: true, moduleKey: 'DASHBOARD' },
    {
        label: 'Oferta Académica',
        icon: 'bi-building',
        moduleKey: 'ACAD',
        children: [
            { label: 'Instituciones', to: '/instituciones', moduleKey: 'INSTITUCIONES' },
            { label: 'Carreras', to: '/carreras', moduleKey: 'CARRERAS' },
            { label: 'Cursos', to: '/cursos', moduleKey: 'CURSOS' },
            { label: 'Grupos', to: '/grupos', moduleKey: 'GRUPOS' },
            { label: 'Periodos', to: '/periodos', moduleKey: 'PERIODOS' },
        ],
    },
    {
        label: 'Personas',
        icon: 'bi-people',
        moduleKey: 'PERSONAS',
        children: [
            { label: 'Profesores', to: '/profesores', moduleKey: 'PROFESORES' },
            { label: 'Expedientes', to: '/expedientes', moduleKey: 'EXPEDIENTES' },
        ],
    },
    {
        label: 'Matrícula',
        icon: 'bi-card-checklist',
        moduleKey: 'MAT',
        children: [
            { label: 'Prematrícula', to: '/prematricula', moduleKey: 'PREMATRICULA' },
            { label: 'Matrícula', to: '/matricula', moduleKey: 'MATRICULA' },
        ],
    },
    {
        label: 'Evaluación',
        icon: 'bi-journal-check',
        moduleKey: 'EVAL',
        children: [
            { label: 'Notas', to: '/notas', moduleKey: 'NOTAS' },
            { label: 'Historial', to: '/historial', moduleKey: 'HISTORIAL' },
            { label: 'Listados', to: '/listados', moduleKey: 'LISTADOS' },
        ],
    },
    {
        label: 'Finanzas',
        icon: 'bi-cash-coin',
        moduleKey: 'FIN',
        children: [
            { label: 'Facturas', to: '/facturas', moduleKey: 'FACTURAS' },
            { label: 'Pagos', to: '/pagos', moduleKey: 'PAGOS' },
        ],
    },
    {
        label: 'Comunicación',
        icon: 'bi-bell',
        moduleKey: 'COM',
        children: [{ label: 'Notificaciones', to: '/notificaciones', moduleKey: 'NOTIFICACIONES' }],
    },
    {
        label: 'Sistema',
        icon: 'bi-gear',
        moduleKey: 'SEG',
        children: [
            { label: 'Usuarios', to: '/usuarios', moduleKey: 'USUARIOS' },
            { label: 'Roles', to: '/roles', moduleKey: 'ROLES' },
            { label: 'Módulos', to: '/modulos', moduleKey: 'MODULOS' },
            { label: 'Parámetros', to: '/parametros', moduleKey: 'PARAMETROS' },
            { label: 'Bitácoras', to: '/bitacoras', moduleKey: 'BITACORAS' },
        ],
    },
];

const cleanText = (str) =>
    String(str || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const KEY_ALIASES = {
    DASHBOARD: ['dashboard', 'dash', 'inicio', 'home', 'tablero', 'panel'],
    ACAD: ['acad', 'academico', 'oferta academica', 'oferta'],
    PERSONAS: ['personas', 'persona', 'personal'],
    MAT: ['seccion matricula', 'modulo matricula', 'area matricula'],
    EVAL: ['eval', 'evaluacion', 'evaluaciones', 'calificaciones'],
    FIN: ['fin', 'finanzas', 'area financiera'],
    COM: ['com', 'comunicacion', 'comunicaciones', 'mensajeria'],
    SEG: ['seg', 'seguridad', 'sis', 'sistema', 'sistemas', 'configuracion'],

    INSTITUCIONES: ['instituciones', 'institucion', 'inst'],
    CARRERAS: ['carreras', 'carrera', 'carr'],
    CURSOS: ['cursos', 'curso', 'curs'],
    GRUPOS: ['grupos', 'grupo', 'grup'],
    PERIODOS: ['periodos', 'periodo', 'peri'],
    PROFESORES: ['profesores', 'profesor', 'prof', 'docentes', 'docente'],
    EXPEDIENTES: ['expedientes', 'expediente', 'exp'],
    PREMATRICULA: ['prematricula', 'prematriculas', 'premat'],
    MATRICULA: ['matricula', 'matriculas', 'matr'],
    NOTAS: ['notas', 'nota', 'not'],
    HISTORIAL: ['historial', 'historial academico', 'hist'],
    LISTADOS: ['listados', 'listado', 'list'],
    FACTURAS: ['facturas', 'factura', 'fact'],
    PAGOS: ['pagos', 'pago'],
    NOTIFICACIONES: ['notificaciones', 'notificacion', 'notif'],
    USUARIOS: ['usuarios', 'usuario', 'usr'],
    ROLES: ['roles', 'rol'],
    MODULOS: ['modulos', 'modulo', 'mod'],
    PARAMETROS: ['parametros', 'parametro', 'par'],
    BITACORAS: ['bitacoras', 'bitacora', 'bit', 'gen1'],
};

export function getFilteredMenu({ role = '', permissions = [], globalModules = [] }) {
    const roleClean = String(role || '').trim().toUpperCase();
    const isAdmin = roleClean === 'ADM' || roleClean.includes('ADMIN');
    const isProf = roleClean === 'PROF' || roleClean.includes('PROF');
    const isEst = roleClean === 'EST' || roleClean.includes('ESTUD');

    const disabledGlobal = new Set();
    if (Array.isArray(globalModules) && globalModules.length > 0) {
        globalModules.forEach((m) => {
            const activo = m.estado ?? m.Estado;
            if (activo === false) {
                if (m.idModulo || m.IdModulo) disabledGlobal.add(cleanText(m.idModulo || m.IdModulo));
                if (m.nombre || m.Nombre) disabledGlobal.add(cleanText(m.nombre || m.Nombre));
            }
        });
    }

    const hasRolePerms = Array.isArray(permissions) && permissions.length > 0;
    const allowedByRole = new Set();
    const deniedByRole = new Set();

    if (hasRolePerms) {
        permissions.forEach((p) => {
            const code = cleanText(p.idModulo || p.IdModulo);
            const name = cleanText(p.nombre || p.Nombre);
            const activo = p.estado ?? p.Estado;
            if (activo === true) {
                if (code) allowedByRole.add(code);
                if (name) allowedByRole.add(name);
            } else if (activo === false) {
                if (code) deniedByRole.add(code);
                if (name) deniedByRole.add(name);
            }
        });
    }

    const matchesCandidate = (val, candidate) => {
        if (!val || !candidate) return false;
        if (val === candidate) return true;

        const valWords = val.split(/[\s_-]+/);
        if (valWords.includes(candidate)) return true;

        const candidateWords = candidate.split(/[\s_-]+/);
        if (candidateWords.includes(val)) return true;

        return false;
    };

    const isMatch = (targetSet, key, label) => {
        const keyClean = cleanText(key);
        const labelClean = cleanText(label);
        const aliases = (KEY_ALIASES[key] || []).map(cleanText);
        const candidates = [keyClean, labelClean, ...aliases].filter(Boolean);

        for (const val of targetSet) {
            for (const candidate of candidates) {
                if (matchesCandidate(val, candidate)) return true;
            }
        }
        return false;
    };

    const isItemAllowed = (item, parentSection = null) => {
        if (isMatch(disabledGlobal, item.moduleKey, item.label)) return false;
        if (parentSection && isMatch(disabledGlobal, parentSection.moduleKey, parentSection.label)) return false;

        if (hasRolePerms) {
            if (isMatch(deniedByRole, item.moduleKey, item.label)) return false;
            if (parentSection && isMatch(deniedByRole, parentSection.moduleKey, parentSection.label)) return false;
        }

        if (isAdmin) {
            return true;
        }

        if (hasRolePerms) {
            if (isMatch(allowedByRole, item.moduleKey, item.label)) return true;
            if (parentSection && isMatch(allowedByRole, parentSection.moduleKey, parentSection.label)) return true;
            return false;
        }

        if (item.moduleKey === 'DASHBOARD') return true;

        if (isProf) {
            const profAllowed = ['EVAL', 'NOTAS', 'LISTADOS', 'ACAD', 'CURSOS', 'GRUPOS', 'COM', 'NOTIFICACIONES'];
            return profAllowed.includes(item.moduleKey) || (parentSection && profAllowed.includes(parentSection.moduleKey));
        }

        if (isEst) {
            const estAllowed = ['MAT', 'PREMATRICULA', 'MATRICULA', 'EVAL', 'NOTAS', 'HISTORIAL', 'FIN', 'FACTURAS', 'PAGOS', 'COM', 'NOTIFICACIONES'];
            return estAllowed.includes(item.moduleKey) || (parentSection && estAllowed.includes(parentSection.moduleKey));
        }

        return false;
    };

    return BASE_MENU.map((section) => {
        if (section.children) {
            const allowedChildren = section.children.filter((child) => isItemAllowed(child, section));
            if (allowedChildren.length > 0) {
                return { ...section, children: allowedChildren };
            }
            return null;
        }
        return isItemAllowed(section) ? section : null;
    }).filter(Boolean);
}

export default BASE_MENU;
