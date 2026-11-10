const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const SESSION_KEYS = ['access_token', 'expires_in', 'refresh_token', 'usuarioID', 'email'];

function decodeJwtPayload(token) {
    try {
        const encodedPayload = token.split('.')[1];
        if (!encodedPayload) return {};

        const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = Uint8Array.from(
            atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
            (character) => character.charCodeAt(0),
        );
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return {};
    }
}

export function getUserFromToken(token, fallbackEmail = '') {
    const claims = decodeJwtPayload(token);
    const subject = typeof claims.sub === 'string' && claims.sub.includes('@')
        ? claims.sub
        : '';
    const role = claims.role ?? claims[ROLE_CLAIM] ?? '';

    return {
        email: claims.email ?? claims[EMAIL_CLAIM] ?? subject ?? fallbackEmail,
        role: Array.isArray(role) ? role.join(', ') : String(role),
    };
}

export function readAuthSession() {
    const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage;
    const accessToken = storage.getItem('access_token');
    if (!accessToken) return null;

    return {
        access_token: accessToken,
        expires_in: storage.getItem('expires_in'),
        refresh_token: storage.getItem('refresh_token'),
        usuarioID: storage.getItem('usuarioID'),
        email: storage.getItem('email') ?? '',
        rememberMe: storage === localStorage,
    };
}

export function saveAuthSession(session, rememberMe = false) {
    clearAuthSession();
    const storage = rememberMe ? localStorage : sessionStorage;

    SESSION_KEYS.forEach((key) => {
        if (session[key] !== undefined && session[key] !== null) {
            storage.setItem(key, String(session[key]));
        }
    });
}

export function clearAuthSession() {
    SESSION_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
}
