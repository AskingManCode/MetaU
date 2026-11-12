import { useEffect, useMemo, useState } from 'react';
import moduloService from '../services/moduloService';
import rolService from '../services/rolService';
import { getFilteredMenu } from '../utils/menu';

export default function useDynamicMenu(role) {
    const [permissions, setPermissions] = useState([]);
    const [globalModules, setGlobalModules] = useState([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const [modulosRes, permisosRes] = await Promise.allSettled([
                    moduloService.getAll(),
                    role ? rolService.getPermisos(role) : Promise.resolve({ data: [] }),
                ]);

                if (!isMounted) return;

                if (modulosRes.status === 'fulfilled' && Array.isArray(modulosRes.value.data)) {
                    setGlobalModules(modulosRes.value.data);
                }

                if (permisosRes.status === 'fulfilled' && Array.isArray(permisosRes.value.data)) {
                    setPermissions(permisosRes.value.data);
                }
            } catch {
            } finally {
                if (isMounted) setPermissionsLoaded(true);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [role]);

    const menuItems = useMemo(() => {
        return getFilteredMenu({ role, permissions, globalModules });
    }, [role, permissions, globalModules]);

    const hasDashboard = useMemo(() => {
        return menuItems.some((item) => item.to === '/' || item.moduleKey === 'DASHBOARD');
    }, [menuItems]);

    const permittedPaths = useMemo(() => {
        const paths = new Set(['/perfil']);
        menuItems.forEach((item) => {
            if (item.to) paths.add(item.to);
            if (item.children) {
                item.children.forEach((child) => {
                    if (child.to) paths.add(child.to);
                });
            }
        });
        return paths;
    }, [menuItems]);

    return {
        menuItems,
        permissionsLoaded,
        hasDashboard,
        permittedPaths,
    };
}
