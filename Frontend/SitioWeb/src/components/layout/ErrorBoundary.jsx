import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import bitacoraService from '../../services/bitacoraService';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary capturó un error de UI:', error, errorInfo);
        const descripcion = `Error de UI: ${error?.message || error?.toString() || 'Error desconocido'}`;
        bitacoraService.create({ descripcion }).catch(() => {});
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container className="p-4 my-4">
                    <Alert variant="danger" className="p-4 shadow-sm rounded-3">
                        <Alert.Heading className="d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-octagon-fill fs-3 text-danger" />
                            Ocurrió un error inesperado en la interfaz
                        </Alert.Heading>
                        <p className="mt-2 text-muted">
                            Se ha registrado el incidente en la bitácora del sistema (GEN1). Puede intentar recargar la página.
                        </p>
                        {this.state.error?.message && (
                            <div className="p-3 bg-light rounded text-danger small font-monospace my-3">
                                {this.state.error.message}
                            </div>
                        )}
                        <div className="d-flex gap-2">
                            <Button variant="danger" onClick={this.handleReset}>
                                <i className="bi bi-arrow-clockwise me-1" /> Recargar página
                            </Button>
                            <Button variant="outline-secondary" onClick={() => (window.location.href = '/')}>
                                <i className="bi bi-house-door me-1" /> Ir al inicio
                            </Button>
                        </div>
                    </Alert>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
