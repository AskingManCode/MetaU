import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Facturas() {

    const handleNuevaFactura = () => {
        alert('Aquí se abrirá la pantalla de Nueva Factura');
        // Ejemplo futuro: navigate('/facturas/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Facturas"
                buttonLabel="Nueva Factura"
                onButtonClick={handleNuevaFactura}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de facturas</p>
                </div>
            </div>
        </div>
    );
}

export default Facturas;