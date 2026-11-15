import { NavLink, useLocation } from 'react-router-dom';

function SubmenuLink({ item, onClick }) {
    const { pathname } = useLocation();
    const isActive = pathname === item.to || pathname.startsWith(item.to + '/');

    return (
        <NavLink
            to={item.to}
            onClick={onClick}
            className={`submenu-item ${isActive ? 'is-active' : ''}`}
        >
            {item.label}
        </NavLink>
    );
}

export default SubmenuLink;
