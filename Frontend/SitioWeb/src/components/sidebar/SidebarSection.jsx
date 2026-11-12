import { useLocation } from 'react-router-dom';
import SubmenuLink from './SubmenuLink';

function SidebarSection({ item, collapsed, open, onToggle, onNavigate }) {
    const { pathname } = useLocation();
    const hasActiveChild = item.children?.some(
        (l) => pathname === l.to || pathname.startsWith(l.to + '/')
    );

    return (
        <div className="sidebar-section">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                title={collapsed ? item.label : undefined}
                className={`menu-item ${hasActiveChild ? 'is-active' : ''}`}
            >
                <i className={`bi ${item.icon} menu-icon`} />
                {!collapsed && (
                    <>
                        <span className="flex-grow-1 text-start">{item.label}</span>
                        <i className={`bi bi-chevron-right menu-chevron ${open ? 'rotated' : ''}`} />
                    </>
                )}
            </button>

            {!collapsed && open && (
                <div className="submenu">
                    {item.children.map((child) => (
                        <SubmenuLink
                            key={child.to}
                            item={child}
                            onClick={onNavigate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SidebarSection;
