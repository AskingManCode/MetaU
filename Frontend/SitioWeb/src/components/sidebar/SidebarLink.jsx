import { NavLink, useLocation } from 'react-router-dom';

function SidebarLink({ item, collapsed, onClick }) {
    const { pathname } = useLocation();
    const isActive = item.end
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(item.to + '/');

    return (
        <NavLink
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            onClick={onClick}
            className={`menu-item ${isActive ? 'is-active' : ''}`}
        >
            <i className={`bi ${item.icon} menu-icon`} />
            {!collapsed && <span>{item.label}</span>}
        </NavLink>
    );
}

export default SidebarLink;
