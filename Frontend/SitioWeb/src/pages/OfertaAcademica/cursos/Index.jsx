import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Cursos() {

    const handleNuevoCurso = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Curso');
        // Ejemplo futuro: navigate('/cursos/nuevo');
    };

    return (
        <div>
        <MaintenanceHeader
            title="Mantenimiento de Cursos"
            buttonLabel="Nuevo Curso"
            onButtonClick={handleNuevoCurso}
        />

        <div className="card border-0 shadow-sm">
            <div className="card-body">
            <p className="text-muted mb-0">Aquí irá el listado de cursos</p>
            </div>
        </div>
        </div>
    );
}

export default Cursos;