import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Carreras() {

    const handleNuevaCarrera = () => {
        // Más adelante aquí abriremos el formulario o navegaremos
        alert('Aquí se abrirá la pantalla de Nueva Carrera');
        // Ejemplo futuro: navigate('/carreras/nuevo');
    };

    return (
        <div>
        <MaintenanceHeader
            title="Mantenimiento de Carreras"
            buttonLabel="Nueva Carrera"
            onButtonClick={handleNuevaCarrera}
        />

        {/* Aquí después irá la tabla / listado */}
        <div className="card border-0 shadow-sm">
            <div className="card-body">
            <p className="text-muted mb-0">Aquí irá el listado de Carreras</p>
            </div>
        </div>
        </div>
    );
}

export default Carreras;