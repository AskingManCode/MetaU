import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Roles() {

    const [notification, setNotification] = useState(null);

    const handleNuevoRol = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Rol' });
        // Ejemplo futuro: navigate('/roles/nuevo');
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
                title="Mantenimiento de Roles"
                buttonLabel="Nuevo Rol"
                onButtonClick={handleNuevoRol}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de roles</p>
                </div>
            </div>
        </div>
    );
}

export default Roles;