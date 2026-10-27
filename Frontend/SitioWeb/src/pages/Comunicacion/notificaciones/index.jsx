import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Notificaciones() {

    const handleNuevaNotificacion = () => {
        alert('Aquí se abrirá la pantalla de Nueva Notificación');
        // Ejemplo futuro: navigate('/notificaciones/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Notificaciones"
                buttonLabel="Nueva Notificación"
                onButtonClick={handleNuevaNotificacion}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de notificaciones</p>
                </div>
            </div>
        </div>
    );
}

export default Notificaciones;