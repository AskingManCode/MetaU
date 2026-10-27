import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Parametros() {

    const handleNuevoParametro = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Parámetro');
        // Ejemplo futuro: navigate('/parametros/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Parámetros"
                buttonLabel="Nuevo Parámetro"
                onButtonClick={handleNuevoParametro}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de parámetros</p>
                </div>
            </div>
        </div>
    );
}

export default Parametros;