import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Prematricula() {

    const [notification, setNotification] = useState(null);

    const handleNuevaPrematricula = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nueva Prematrícula' });
        // Ejemplo futuro: navigate('/prematricula/nuevo');
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
                title="Mantenimiento de Prematrícula"
                buttonLabel="Nueva Prematrícula"
                onButtonClick={handleNuevaPrematricula}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de pre-matrículas</p>
                </div>
            </div>
        </div>
    );
}

export default Prematricula;