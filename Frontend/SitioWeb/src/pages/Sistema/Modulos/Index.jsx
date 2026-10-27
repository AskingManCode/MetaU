import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Modulos() {

    const handleNuevoModulo = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Módulo');
        // Ejemplo futuro: navigate('/modulos/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Módulos"
                buttonLabel="Nuevo Módulo"
                onButtonClick={handleNuevoModulo}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de módulos</p>
                </div>
            </div>
        </div>
    );
}

export default Modulos;