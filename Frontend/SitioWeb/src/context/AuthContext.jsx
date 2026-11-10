import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordAuthAudit } from '../services/authAuditService';
import authService, { refreshAuthSession } from '../services/authService';
import AuthContext from './authContextValue';
import {
    clearAuthSession,
    getUserFromToken,
    readAuthSession,
    saveAuthSession,
} from '../services/authSession';

function setAuthenticatedSession(session, setAuthState) {
    setAuthState({
        status: 'authenticated',
        user: getUserFromToken(session.access_token, session.email),
    });
}

async function restoreSession(session) {
    try {
        const response = await authService.validate(session.access_token);
        if (response.data === true) return session;
    } catch (error) {
        if (error.response?.status !== 401) throw error;
    }

    if (!session.refresh_token) {
        clearAuthSession();
        return null;
    }
    try {
        return await refreshAuthSession();
    } catch (error) {
        clearAuthSession();
        throw error;
    }
}

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState({
        status: 'loading',
        user: null,
    });

    useEffect(() => {
        let isMounted = true;

        const initializeSession = async () => {
            const session = readAuthSession();
            if (!session?.access_token) {
                if (isMounted) setAuthState({ status: 'unauthenticated', user: null });
                return;
            }

            try {
                const restoredSession = await restoreSession(session);
                if (isMounted) {
                    if (restoredSession) setAuthenticatedSession(restoredSession, setAuthState);
                    else setAuthState({ status: 'unauthenticated', user: null });
                }
            } catch (error) {
                if (error.response?.status === 401) clearAuthSession();
                else console.error('No se pudo validar la sesión existente.', error);
                if (isMounted) setAuthState({ status: 'unauthenticated', user: null });
            }
        };

        initializeSession();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const handleExpiredSession = () => {
            setAuthState({ status: 'unauthenticated', user: null });
            navigate('/login', { replace: true });
        };

        window.addEventListener('auth:session-expired', handleExpiredSession);
        return () => window.removeEventListener('auth:session-expired', handleExpiredSession);
    }, [navigate]);

    const login = useCallback(async (email, password, rememberMe) => {
        const { data } = await authService.login(email, password);
        if (
            !data?.access_token
            || !data?.refresh_token
            || !data?.expires_in
            || !data?.usuarioID
        ) {
            throw new Error('La respuesta de login no contiene los datos de sesión requeridos');
        }

        const session = { ...data, email };
        saveAuthSession(session, rememberMe);
        setAuthenticatedSession(session, setAuthState);

        void recordAuthAudit('El usuario inició sesión', session)
            .catch((error) => console.error('No se pudo registrar la bitácora de login.', error));
    }, []);

    const logout = useCallback(() => {
        const session = readAuthSession();
        if (session?.access_token && session.usuarioID) {
            void recordAuthAudit('El usuario cerró sesión', session)
                .catch((error) => console.error('No se pudo registrar la bitácora de logout.', error));
        }

        clearAuthSession();
        setAuthState({ status: 'unauthenticated', user: null });
        navigate('/login', { replace: true });
    }, [navigate]);

    const value = useMemo(() => ({
        ...authState,
        isAuthenticated: authState.status === 'authenticated',
        login,
        logout,
    }), [authState, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
