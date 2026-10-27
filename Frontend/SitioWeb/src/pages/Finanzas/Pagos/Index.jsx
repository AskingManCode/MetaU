import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Pagos() {

    const handleNuevoPago = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Pago');
        // Ejemplo futuro: navigate('/pagos/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Pagos"
                buttonLabel="Nuevo Pago"
                onButtonClick={handleNuevoPago}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de pagos</p>
                </div>
            </div>
        </div>
    );
}

export default Pagos;