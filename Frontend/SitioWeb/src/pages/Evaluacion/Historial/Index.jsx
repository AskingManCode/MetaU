import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Historial() {

    const handleNuevoHistorial = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Historial');
        // Ejemplo futuro: navigate('/historial/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Historial"
                buttonLabel="Nuevo Historial"
                onButtonClick={handleNuevoHistorial}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de historial</p>
                </div>
            </div>
        </div>
    );
}

export default Historial;