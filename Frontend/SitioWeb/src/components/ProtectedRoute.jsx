import { Spinner } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
    const { status, isAuthenticated } = useAuth();

    if (status === 'loading') {
        return (
            <div className="d-flex min-vh-100 align-items-center justify-content-center gap-2">
                <Spinner animation="border" role="status" size="sm">
                    <span className="visually-hidden">Validando sesión...</span>
                </Spinner>
                <span>Validando sesión...</span>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}
