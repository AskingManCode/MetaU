import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Notas() {

    const handleNuevaNota = () => {
        alert('Aquí se abrirá la pantalla de Nueva Nota');
        // Ejemplo futuro: navigate('/notas/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Notas"
                buttonLabel="Nueva Nota"
                onButtonClick={handleNuevaNota}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de notas</p>
                </div>
            </div>
        </div>
    );
}

export default Notas;