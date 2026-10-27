import { useLocation } from 'react-router-dom';
import SubmenuLink from './SubmenuLink';

const menuClass = (isActive) => `menu-item ${isActive ? 'is-active' : ''}`;

function SidebarSection({ item, collapsed, open, onToggle }) {
    
    const { pathname } = useLocation();
    const hasActiveChild = item.children.some((l) => pathname.startsWith(l.to));

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                title={collapsed ? item.label : undefined}
                className={menuClass(hasActiveChild)}
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
                        <SubmenuLink key={child.to} item={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SidebarSection;