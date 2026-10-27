import PageHeader from '../../../components/PageHeader';

function Listados() {

    const handleNuevoListado = () => {
        alert('Aquí se abrirá la pantalla de Nuevo Listado');
        // Ejemplo futuro: navigate('/listados/nuevo');
    };

    return (
        <div>
            <PageHeader title="Listados ??? idk" />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">Aquí irá el listado de listados</p>
                </div>
            </div>
        </div>
    );
}

export default Listados;