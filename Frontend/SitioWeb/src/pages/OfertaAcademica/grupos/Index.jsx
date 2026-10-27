import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Grupos() {
    
    const [notification, setNotification] = useState(null);

    const handleNuevoGrupo = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Grupo' });
        // Ejemplo futuro: navigate('/grupos/nuevo');
    };

    return (
        <div>
            <Notification
                type={notification?.type}
                message={notification?.message}
                show={!!notification}
                onClose={() => setNotification(null)}
            />

            <MaintenanceHeader
                title="Mantenimiento de Grupos"
                buttonLabel="Nuevo Grupo"
                onButtonClick={handleNuevoGrupo}
            />

            <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <p className="text-muted mb-0">Aquí irá el listado de grupos</p>
                    </div>
            </div>
        </div>
    );
}

export default Grupos;