import { NavLink } from 'react-router-dom';

const menuClass = (isActive) => `menu-item ${isActive ? 'is-active' : ''}`;

function SidebarLink({ item, collapsed }) {
    return (
        <NavLink
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => menuClass(isActive)}
        >
            <i className={`bi ${item.icon} menu-icon`} />
            {!collapsed && <span>{item.label}</span>}
        </NavLink>
    );
}

export default SidebarLink;