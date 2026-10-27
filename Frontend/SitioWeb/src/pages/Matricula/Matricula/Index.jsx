import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Matricula() {

    const handleNuevaMatricula = () => {
        alert('Aquí se abrirá la pantalla de Nueva Matrícula');
        // Ejemplo futuro: navigate('/matricula/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Matrícula"
                buttonLabel="Nueva Matrícula"
                onButtonClick={handleNuevaMatricula}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de matrículas</p>
                </div>
            </div>
        </div>
    );
}

export default Matricula;