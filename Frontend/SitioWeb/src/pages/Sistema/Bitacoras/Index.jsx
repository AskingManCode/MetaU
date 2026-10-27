import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Bitacoras() {
    return (
        <div>
            <MaintenanceHeader
                title="Bitácoras"
                buttonLabel="Nueva Bitácora"
                onButtonClick={() => alert('Las bitácoras normalmente son de solo lectura, ESTO ES UN PLACEHOLDER')}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de bitácoras</p>
                </div>
            </div>
        </div>
    );
}

export default Bitacoras;