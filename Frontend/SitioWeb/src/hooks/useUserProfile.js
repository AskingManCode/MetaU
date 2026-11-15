import { useEffect, useState } from 'react';
import usuarioService from '../services/usuarioService';
import { formatRole } from '../utils/navigationUtils';

export default function useUserProfile(user) {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (!user?.email) return;
        setUserName(user.email);

        let isMounted = true;
        usuarioService.getByEmail(user.email)
            .then((res) => {
                if (!isMounted) return;
                const nombre = res.data?.nombreCompleto ?? res.data?.NombreCompleto;
                if (nombre) setUserName(nombre);
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [user?.email]);

    return {
        userName: userName || user?.email || 'Usuario',
        userRole: formatRole(user?.role),
    };
}
