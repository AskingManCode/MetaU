import usuarioService from './usuarioService';
import carreraService from './carreraService';
import cursoService from './cursoService';
import periodoService from './periodoService';
import facturaService from './facturaService';
import grupoService from './grupoService';
import bitacoraService from './bitacoraService';
import { readAuthSession } from './authSession';
import { recordAuthAudit } from './authAuditService';

const list = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;
    return data?.items ?? data?.datos ?? data?.data ?? [];
};

const value = (item, ...keys) => keys
    .map((key) => item?.[key])
    .find((itemValue) => itemValue !== undefined && itemValue !== null);

const isActivePeriod = (period) => {
    const start = value(period, 'fechaInicio', 'FechaInicio');
    const end = value(period, 'fechaFin', 'FechaFin');

    if (!start && !end) {
        const status = String(value(period, 'estado', 'Estado') ?? '').toLowerCase();
        return ['activo', 'active', 'abierto', 'open'].includes(status);
    }

    const today = new Date();
    const startsBeforeToday = !start || new Date(start) <= today;
    const endsAfterToday = !end || new Date(end) >= today;
    return startsBeforeToday && endsAfterToday;
};

const recentDate = (item) => value(
    item,
    'fecha',
    'Fecha',
    'fechaRegistro',
    'FechaRegistro',
    'fechaCreacion',
    'FechaCreacion',
) ?? '';

async function getAdminMetrics() {
    const [users, careers, courses, periods] = await Promise.all([
        usuarioService.getAll(),
        carreraService.getAll(),
        cursoService.getAll(),
        periodoService.getAll(),
    ]);

    const periodList = list(periods);
    const activePeriods = periodList.filter(isActivePeriod);
    let pendingInvoices = null;

    if (activePeriods.length > 0) {
        try {
            const invoices = await facturaService.getByPeriodo(
                value(activePeriods[0], 'periodoID', 'PeriodoID'),
            );
            pendingInvoices = list(invoices).filter((invoice) => {
                const status = String(value(invoice, 'estado', 'Estado') ?? '').toLowerCase();
                return ['pendiente', 'pending', 'emitida', 'issued'].includes(status);
            }).length;
        } catch {
            pendingInvoices = null;
        }
    }

    return {
        users: list(users).length,
        careers: list(careers).length,
        courses: list(courses).length,
        activePeriods: activePeriods.length,
        pendingInvoices,
    };
}

async function getProfessorMetrics() {
    const groups = list(await grupoService.getAll());
    const courseCodes = new Set(
        groups
            .map((group) => value(group, 'cursoCode', 'CursoCode', 'codigoCurso', 'CodigoCurso'))
            .filter(Boolean),
    );

    return {
        groups: groups.length,
        courses: courseCodes.size,
    };
}

async function getRecentAudits() {
    const audits = list(await bitacoraService.getAll());

    return audits
        .filter((audit) => {
            const description = String(value(audit, 'descripcion', 'Descripcion') ?? '').toLowerCase();
            return /crear|creó|creado|modificar|modificó|actualizar|eliminar|eliminó|error|fallo|exporta|exportó/.test(description);
        })
        .sort((first, second) => new Date(recentDate(second)) - new Date(recentDate(first)))
        .slice(0, 5);
}

export async function loadDashboardData(role) {
    const normalizedRole = String(role ?? '').toLowerCase();
    const isProfessor = normalizedRole.includes('profesor') || normalizedRole.includes('teacher');
    const metrics = isProfessor ? await getProfessorMetrics() : await getAdminMetrics();

    let audits = [];
    try {
        audits = await getRecentAudits();
    } catch {
        audits = [];
    }

    return {
        metrics,
        audits,
        notifications: [],
        notificationsAvailable: false,
    };
}

export function recordDashboardView() {
    const session = readAuthSession();

    if (!session?.access_token || !session?.usuarioID) {
        return Promise.resolve();
    }

    return recordAuthAudit('El usuario visualizó el dashboard', session);
}
