import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Facturas() {

    const [notification, setNotification] = useState(null);

    const handleNuevaFactura = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nueva Factura' });
        // Ejemplo futuro: navigate('/facturas/nuevo');
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
                title="Mantenimiento de Facturas"
                buttonLabel="Nueva Factura"
                onButtonClick={handleNuevaFactura}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de facturas</p>
                </div>
            </div>
        </div>
    );
}

export default Facturas;