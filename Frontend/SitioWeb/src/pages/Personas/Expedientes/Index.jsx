import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Expedientes() {

    const handleNuevoExpediente = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Expediente');
        // Ejemplo futuro: navigate('/expedientes/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Expedientes"
                buttonLabel="Nuevo Expediente"
                onButtonClick={handleNuevoExpediente}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                <p className="text-muted mb-0">Aquí irá el listado de expedientes</p>
                </div>
            </div>
        </div>
    );
}

export default Expedientes;