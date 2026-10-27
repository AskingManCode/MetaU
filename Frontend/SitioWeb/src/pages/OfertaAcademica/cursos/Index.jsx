import MaintenanceHeader from '../../../components/MaintenanceHeader';
import Notification from '../../../components/Notification';
import { useState } from 'react';

function Cursos() {

    const [notification, setNotification] = useState(null);

    const handleNuevoCurso = () => {
        setNotification({ type: 'info', message: 'Aquí se abrirá la pantalla de Nuevo Curso' });
        // Ejemplo futuro: navigate('/cursos/nuevo');
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
                title="Mantenimiento de Cursos"
                buttonLabel="Nuevo Curso"
                onButtonClick={handleNuevoCurso}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de cursos</p>
                </div>
            </div>
        </div>
    );
}

export default Cursos;