import { NavLink } from 'react-router-dom';

function SubmenuLink({ item }) {
    return (
        <NavLink
            to={item.to}
            className={({ isActive }) => `submenu-item ${isActive ? 'is-active' : ''}`}
        >
            {item.label}
        </NavLink>
    );
}

export default SubmenuLink;