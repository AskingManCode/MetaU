const MENU = [
    
    { label: 'Dashboard', icon: 'bi-house-door', to: '/', end: true },
    {
        label: 'Oferta Académica',
        icon: 'bi-building',
        children: [
            { label: 'Instituciones', to: '/instituciones' },
            { label: 'Carreras', to: '/carreras' },
            { label: 'Cursos', to: '/cursos' },
            { label: 'Grupos', to: '/grupos' },
            { label: 'Periodos', to: '/periodos' },
        ],
    },
    {
        label: 'Personas',
        icon: 'bi-people',
        children: [
            { label: 'Profesores', to: '/profesores' },
            { label: 'Expedientes', to: '/expedientes' },
        ],
    },
    {
        label: 'Matrícula',
        icon: 'bi-card-checklist',
        children: [
            { label: 'Prematrícula', to: '/prematricula' },
            { label: 'Matrícula', to: '/matricula' },
        ],
    },
    {
        label: 'Evaluación',
        icon: 'bi-journal-check',
        children: [
            { label: 'Notas', to: '/notas' },
            { label: 'Historial', to: '/historial' },
            { label: 'Listados', to: '/listados' },
        ],
    },
    {
        label: 'Finanzas',
        icon: 'bi-cash-coin',
        children: [
            { label: 'Facturas', to: '/facturas' },
            { label: 'Pagos', to: '/pagos' },
        ],
    },
    {
        label: 'Comunicación',
        icon: 'bi-bell',
        children: [{ label: 'Notificaciones', to: '/notificaciones' }],
    },
    {
        label: 'Sistema',
        icon: 'bi-gear',
        children: [
            { label: 'Usuarios', to: '/usuarios' },
            { label: 'Roles', to: '/roles' },
            { label: 'Módulos', to: '/modulos' },
            { label: 'Parámetros', to: '/parametros' },
            { label: 'Bitácoras', to: '/bitacoras' },
        ],
    },
];

export default MENU;