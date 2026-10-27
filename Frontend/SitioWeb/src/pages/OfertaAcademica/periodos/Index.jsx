import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Periodos() {

    const [notification, setNotification] = useState(null);

    const handleNuevoPeriodo = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Periodo' });
        // Ejemplo futuro: navigate('/periodos/nuevo');
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
                title="Mantenimiento de Periodos"
                buttonLabel="Nuevo Periodo"
                onButtonClick={handleNuevoPeriodo}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de periodos</p>
                </div>
            </div>
        </div>
    );
}

export default Periodos;