import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Prematricula() {

    const handleNuevaPrematricula = () => {
        alert('Aquí se abrirá la pantalla de Nueva Pre-matrícula');
        // Ejemplo futuro: navigate('/prematricula/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Pre-matrícula"
                buttonLabel="Nueva Pre-matrícula"
                onButtonClick={handleNuevaPrematricula}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de pre-matrículas</p>
                </div>
            </div>
        </div>
    );
}

export default Prematricula;