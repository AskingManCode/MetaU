import { Button } from 'react-bootstrap';
import '../styles/MaintenanceHeader.css';

function MaintenanceHeader({ title, buttonLabel, onButtonClick }) {
  return (
    <div className="maintenance-header">
      <h5 className="maintenance-header-title">{title}</h5>

      <Button
        size="sm"
        onClick={onButtonClick}
        className="maintenance-btn"
      >
        <i className="bi bi-file-earmark-plus"></i>
        {buttonLabel}
      </Button>
    </div>
  );
}

export default MaintenanceHeader;