import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Carreras() {

    const [notification, setNotification] = useState(null);

    const handleNuevaCarrera = () => {
        // Más adelante aquí abriremos el formulario o navegaremos
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nueva Carrera' });
        // Ejemplo futuro: navigate('/carreras/nuevo');
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
                title="Mantenimiento de Carreras"
                buttonLabel="Nueva Carrera"
                onButtonClick={handleNuevaCarrera}
            />

            {/* Aquí después irá la tabla / listado */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de Carreras</p>
                </div>
            </div>
        </div>
    );
}

export default Carreras;