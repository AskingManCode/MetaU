import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Pagos() {

    const [notification, setNotification] = useState(null);

    const handleNuevoPago = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Pago' });
        // Ejemplo futuro: navigate('/pagos/nuevo');
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
                title="Mantenimiento de Pagos"
                buttonLabel="Nuevo Pago"
                onButtonClick={handleNuevoPago}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de pagos</p>
                </div>
            </div>
        </div>
    );
}

export default Pagos;