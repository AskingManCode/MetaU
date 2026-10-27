import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Listados() {

    const handleNuevoListado = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Listado');
        // Ejemplo futuro: navigate('/listados/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Listados"
                buttonLabel="Nuevo Listado"
                onButtonClick={handleNuevoListado}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de listados</p>
                </div>
            </div>
        </div>
    );
}

export default Listados;