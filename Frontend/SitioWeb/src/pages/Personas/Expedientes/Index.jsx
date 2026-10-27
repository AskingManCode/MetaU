import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Expedientes() {

    const [notification, setNotification] = useState(null);

    const handleNuevoExpediente = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Expediente' });
        // Ejemplo futuro: navigate('/expedientes/nuevo');
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
                title="Mantenimiento de Expedientes"
                buttonLabel="Nuevo Expediente"
                onButtonClick={handleNuevoExpediente}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de expedientes</p>
                </div>
            </div>
        </div>
    );
}

export default Expedientes;