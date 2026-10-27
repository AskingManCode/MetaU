import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Grupos() {
    
    const handleNuevoGrupo = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Grupo');
        // Ejemplo futuro: navigate('/grupos/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Grupos"
                buttonLabel="Nuevo Grupo"
                onButtonClick={handleNuevoGrupo}
            />

            <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <p className="text-muted mb-0">Aquí irá el listado de grupos</p>
                    </div>
            </div>
        </div>
    );
}

export default Grupos;