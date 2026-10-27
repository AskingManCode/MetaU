import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Periodos() {

    const handleNuevoPeriodo = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Periodo');
        // Ejemplo futuro: navigate('/periodos/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Periodos"
                buttonLabel="Nuevo Periodo"
                onButtonClick={handleNuevoPeriodo}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                <p className="text-muted mb-0">Aquí irá el listado de periodos</p>
                </div>
            </div>
        </div>
    );
}

export default Periodos;