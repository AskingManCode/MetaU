import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Profesores() {
    
    const handleNuevoProfesor = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Profesor');
        // Ejemplo futuro: navigate('/profesores/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Profesores"
                buttonLabel="Nuevo Profesor"
                onButtonClick={handleNuevoProfesor}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                <p className="text-muted mb-0">Aquí irá el listado de profesores</p>
                </div>
            </div>
        </div>
    );
}

export default Profesores;