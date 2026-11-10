import PageHeader from '../../components/PageHeader';

function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" /> 
      {/** Es opcional dejar el PageHeader, lo dejé
       *  por estándar pero puede ser más elaborado, no hay 
       * reglas de como hacerlo en requerimientos */}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <p className="text-muted mb-0">
            Aquí irá el contenido del Dashboard (Bienvenida, accesos rápidos, etc)
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;