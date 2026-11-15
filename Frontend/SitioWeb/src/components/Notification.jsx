import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../styles/Notification.css';

function Notification({ 
    type = 'info', 
    message, 
    onClose, 
    show = true,
    onConfirm,   // solo se usa en warning
    onCancel,    // solo se usa en warning
}) {

    const isConfirm = type === 'warning' && (onConfirm || onCancel);

    useEffect(() => {

        if (show && message && !isConfirm) {

            const timer = setTimeout(() => onClose?.(), 4000);
            return () => clearTimeout(timer);
        }

    }, [show, message, onClose, isConfirm]);

    if (!show || !message) return null;

    const icons = {
        success: 'bi-check-circle-fill',         // éxito 
        error: 'bi-exclamation-triangle-fill',   // errores no controlados
        warning: 'bi-exclamation-circle-fill',   // para eliminación de registros o preguntar antes de hacer
        info: 'bi-info-circle-fill',             // información al usuario
    };

    return (

        <div className={`notification ${type}`}>
            <div className="notification-content">

                <i className={`bi ${icons[type]} notification-icon`}></i>
                <span className="notification-message">{message}</span>
                {!isConfirm && (
                    <button className="notification-close" onClick={onClose} aria-label="Cerrar">
                        ×
                    </button>
                )}

            </div>

            {isConfirm && (

                <div className="notification-actions">
                    <Button 
                        size="sm" 
                        variant="outline-secondary" 
                        onClick={onCancel || onClose}
                    >
                        No
                    </Button>

                    <Button 
                        size="sm" 
                        variant="warning" 
                        onClick={onConfirm}
                    >
                        Sí
                    </Button>

                </div>
            )}
            
        </div>
  );
}

export default Notification;


/** 
 * const [notification, setNotification] = useState(null);

const handleEliminar = () => {
    setNotification({
        type: 'warning',
        message: '¿Está seguro que desea eliminar este registro?',
        onConfirm: () => {
        // aquí va la lógica de eliminar
            setNotification({ type: 'success', message: 'Registro eliminado' });
        },
        onCancel: () => setNotification(null),
    });
};

// En el JSX:
<Notification
    type={notification?.type}
    message={notification?.message}
    show={!!notification}
    onClose={() => setNotification(null)}
    onConfirm={notification?.onConfirm}
    onCancel={notification?.onCancel}
/>

 *
 */