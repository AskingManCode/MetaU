export default function Footer({ systemName }) {
    return (
        <footer className="app-footer bg-white border-top text-muted small py-2 px-4 d-flex align-items-center justify-content-between">
            <span>© {new Date().getFullYear()} {systemName}</span>
            <span className="d-none d-md-inline">v0.1.0</span>
        </footer>
    );
}
