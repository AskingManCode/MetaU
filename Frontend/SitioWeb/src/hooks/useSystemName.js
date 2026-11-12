import { useEffect, useState } from 'react';
import parametroService from '../services/parametroService';

export default function useSystemName(defaultName = 'MetaU') {
    const [systemName, setSystemName] = useState(defaultName);

    useEffect(() => {
        let isMounted = true;

        parametroService.getById('SYSNAME')
            .then((res) => {
                if (!isMounted) return;
                const valor = res.data?.valor ?? res.data?.Valor;
                if (typeof valor === 'string' && valor.trim()) {
                    setSystemName(valor.trim());
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, []);

    return systemName;
}
