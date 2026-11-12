import { useEffect, useRef } from 'react';
import bitacoraService from '../services/bitacoraService';

export default function useLayoutAudit({ userEmail, routeInfo, pathname }) {
    const lastLoggedRouteRef = useRef('');

    useEffect(() => {
        if (!userEmail) return;
        const recorded = sessionStorage.getItem('meta_u_bitacora_acceso');
        if (!recorded) {
            sessionStorage.setItem('meta_u_bitacora_acceso', 'true');
            bitacoraService.create({ descripcion: 'El usuario accedió al sistema' }).catch(() => {});
        }
    }, [userEmail]);

    useEffect(() => {
        if (routeInfo.isCritical && lastLoggedRouteRef.current !== pathname) {
            lastLoggedRouteRef.current = pathname;
            bitacoraService.create({
                descripcion: `Navegación a pantalla crítica: ${routeInfo.title} (${pathname})`,
            }).catch(() => {});
        }
    }, [pathname, routeInfo.isCritical, routeInfo.title]);

    useEffect(() => {
        const handleError = (e) => {
            const errorMsg = e?.message || e?.error?.message || 'Error no controlado en la interfaz';
            bitacoraService.create({ descripcion: `Error de UI: ${errorMsg}` }).catch(() => {});
        };

        const handleRejection = (e) => {
            const reason = e?.reason?.message || e?.reason || 'Rechazo de promesa no controlado en la interfaz';
            bitacoraService.create({ descripcion: `Error de UI (asíncrono): ${reason}` }).catch(() => {});
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);
}
