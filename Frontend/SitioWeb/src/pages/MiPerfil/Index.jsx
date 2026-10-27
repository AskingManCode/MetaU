import PageHeader from '../../components/PageHeader';

function Perfil() {
    return (
        <div>
            <PageHeader title="Mi Perfil" />

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <p className="text-muted mb-0">
                        Aquí irá la información del perfil del usuario.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Perfil;