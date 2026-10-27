import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Notas() {

    const [notification, setNotification] = useState(null);

    const handleNuevaNota = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nueva Nota' });
        // Ejemplo futuro: navigate('/notas/nuevo');
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
                title="Mantenimiento de Notas"
                buttonLabel="Nueva Nota"
                onButtonClick={handleNuevaNota}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de notas</p>
                </div>
            </div>
        </div>
    );
}

export default Notas;