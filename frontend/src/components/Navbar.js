
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [adminLoggedIn, setAdminLoggedIn] = useState(
    () => Boolean(localStorage.getItem('token'))
  );

  // Keep the navbar in sync when login or logout occurs.
  useEffect(() => {
    function syncAuth() {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      } catch {
        setUser(null);
      }

      setAdminLoggedIn(Boolean(localStorage.getItem('token')));
    }

    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-change', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function logoutUser() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');

    setUser(null);
    closeMenu();

    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  }

  function logoutAdmin() {
    localStorage.removeItem('token');

    setAdminLoggedIn(false);
    closeMenu();

    window.dispatchEvent(new Event('auth-change'));
    navigate('/admin/login');
  }

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >
          <span className="navbar-logo">🌿</span>

          <span className="navbar-brand-text">
            <strong>EcoMap</strong>
            <small>Greener communities</small>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links${menuOpen ? ' nav-open' : ''}`}>
          <NavLink
            to="/"
            end
            className={linkClass}
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/map"
            className={linkClass}
            onClick={closeMenu}
          >
            Map
          </NavLink>

          <NavLink
            to="/report"
            className="nav-link nav-report"
            onClick={closeMenu}
          >
            <span aria-hidden="true">+</span> Report Issue
          </NavLink>

          <NavLink
            to="/dashboard"
            className={linkClass}
            onClick={closeMenu}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/about"
            className={linkClass}
            onClick={closeMenu}
          >
            About
          </NavLink>

          {/* User navigation */}
          {user ? (
            <>
              <NavLink
                to="/my-reports"
                className={linkClass}
                onClick={closeMenu}
              >
                My Reports
              </NavLink>

              <span className="nav-link nav-user-greeting">
                Hi, {user.name || user.email || 'User'}
              </span>

              <button
                type="button"
                className="nav-link nav-logout"
                onClick={logoutUser}
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={linkClass}
              onClick={closeMenu}
            >
              Login / Register
            </NavLink>
          )}

          {/* Keep administrator authentication separate */}
          <span className="nav-divider" aria-hidden="true" />

          {adminLoggedIn ? (
            <>
              <NavLink
                to="/admin"
                className={linkClass}
                onClick={closeMenu}
              >
                Admin Panel
              </NavLink>

              <button
                type="button"
                className="nav-link nav-logout"
                onClick={logoutAdmin}
              >
                Admin Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/admin/login"
              className={linkClass}
              onClick={closeMenu}
            >
              Admin Login
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
