import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Profesores() {
    
    const [notification, setNotification] = useState(null);

    const handleNuevoProfesor = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Profesor' });
        // Ejemplo futuro: navigate('/profesores/nuevo');
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
                title="Mantenimiento de Profesores"
                buttonLabel="Nuevo Profesor"
                onButtonClick={handleNuevoProfesor}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de profesores</p>
                </div>
            </div>
        </div>
    );
}

export default Profesores;