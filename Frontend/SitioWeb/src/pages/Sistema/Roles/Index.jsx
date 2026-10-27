import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Roles() {

    const handleNuevoRol = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Rol');
        // Ejemplo futuro: navigate('/roles/nuevo');
    };

    return (
        <div>
            <MaintenanceHeader
                title="Mantenimiento de Roles"
                buttonLabel="Nuevo Rol"
                onButtonClick={handleNuevoRol}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de roles</p>
                </div>
            </div>
        </div>
    );
}

export default Roles;