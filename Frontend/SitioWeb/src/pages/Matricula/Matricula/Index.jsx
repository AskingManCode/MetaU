import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Matricula() {

    const [notification, setNotification] = useState(null);

    const handleNuevaMatricula = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nueva Matrícula' });
        // Ejemplo futuro: navigate('/matricula/nuevo');
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
                title="Mantenimiento de Matrícula"
                buttonLabel="Nueva Matrícula"
                onButtonClick={handleNuevaMatricula}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de matrículas</p>
                </div>
            </div>
        </div>
    );
}

export default Matricula;