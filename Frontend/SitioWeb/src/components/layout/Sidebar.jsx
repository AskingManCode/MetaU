import { Button } from 'react-bootstrap';
import logo from '../../assets/logo.png';
import SidebarLink from '../sidebar/SidebarLink';
import SidebarSection from '../sidebar/SidebarSection';

export default function Sidebar({
    systemName,
    userRole,
    menuItems,
    isOpen,
    openSection,
    onToggleCollapse,
    onToggleSection,
    onNavigate,
    onCloseBackdrop,
}) {
    return (
        <>
            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={onCloseBackdrop}
                    aria-hidden="true"
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logo} alt={`Logo ${systemName}`} className="sidebar-logo" />
                    {isOpen && (
                        <div className="d-flex flex-column text-truncate">
                            <span className="sidebar-title" title={systemName}>{systemName}</span>
                            <span className="sidebar-subtitle">{userRole}</span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) =>
                        item.children ? (
                            <SidebarSection
                                key={item.label}
                                item={item}
                                collapsed={!isOpen}
                                open={openSection === item.label}
                                onToggle={() => onToggleSection(item.label)}
                                onNavigate={onNavigate}
                            />
                        ) : (
                            <SidebarLink
                                key={item.label}
                                item={item}
                                collapsed={!isOpen}
                                onClick={onNavigate}
                            />
                        )
                    )}
                </nav>

                <div className="sidebar-footer">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}
                        onClick={onToggleCollapse}
                        aria-label={isOpen ? 'Contraer menú' : 'Expandir menú'}
                        title={isOpen ? 'Contraer menú' : 'Expandir menú'}
                    >
                        <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`} />
                    </Button>
                </div>
            </aside>
        </>
    );
}
