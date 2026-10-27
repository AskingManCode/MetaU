import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Instituciones() {

  const handleNuevaInstitucion = () => {
    // Más adelante aquí abriremos el formulario o navegaremos
    alert('Aquí se abrirá la pantalla de Nueva Institución');
    // Ejemplo futuro: navigate('/instituciones/nuevo');
  };

  return (
    <div>
      <MaintenanceHeader
        title="Mantenimiento de Instituciones"
        buttonLabel="Nueva Institución"
        onButtonClick={handleNuevaInstitucion}
      />

      {/* Aquí después irá la tabla / listado */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <p className="text-muted mb-0">Aquí irá el listado de instituciones</p>
        </div>
      </div>
    </div>
  );
}

export default Instituciones;