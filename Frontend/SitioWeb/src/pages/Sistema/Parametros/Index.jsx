import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Parametros() {

    const [notification, setNotification] = useState(null);

    const handleNuevoParametro = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Parámetro' });
        // Ejemplo futuro: navigate('/parametros/nuevo');
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
                title="Mantenimiento de Parámetros"
                buttonLabel="Nuevo Parámetro"
                onButtonClick={handleNuevoParametro}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de parámetros</p>
                </div>
            </div>
        </div>
    );
}

export default Parametros;