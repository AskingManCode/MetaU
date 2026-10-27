import MaintenanceHeader from '../../../components/MaintenanceHeader';

function Usuarios() {

  const handleNuevoUsuario = () => {
    // Aquí más adelante abriremos el formulario o navegaremos a otra pantalla
    alert('Aquí se abrirá la pantalla de Nuevo Usuario');
    // Ejemplo futuro: navigate('/usuarios/nuevo');
  };

  return (
    <div>
        
      <MaintenanceHeader
        title="Mantenimiento de Usuarios"
        buttonLabel="Nuevo Usuario"
        onButtonClick={handleNuevoUsuario}
      />

      {/* Aquí después irá la tabla / listado */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <p className="text-muted mb-0">Aquí irá el listado de usuarios</p>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;