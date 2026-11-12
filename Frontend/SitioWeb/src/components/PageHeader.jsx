import '../styles/MaintenanceHeader.css';

function PageHeader({ title }) {

    return (
        <div className="maintenance-header">
            <h5 className="maintenance-header-title mb-0">{title}</h5>
        </div>
    );
}

export default PageHeader;