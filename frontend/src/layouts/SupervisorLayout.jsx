import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SupervisorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLightMode, setIsLightMode] = useState(localStorage.getItem('theme') !== 'dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== 'dark') {
      document.documentElement.classList.add('light-mode');
      setIsLightMode(true);
    } else {
      document.documentElement.classList.remove('light-mode');
      setIsLightMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      root.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo" style={{ justifyContent: 'center' }}>
          <img src="/logo.png" alt="Laksan BPOM" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-menu">
          <NavLink 
            to="/dashboard" 
            end 
            className={() => `menu-item ${location.pathname === '/dashboard' || (location.pathname.includes('/capa') && (!location.pathname.endsWith('/pdf') && !location.pathname.endsWith('/view') || location.search.includes('from=antrean'))) ? 'active' : ''}`}
          >
            <span className="menu-icon">📥</span>
            <span className="menu-text">Antrean</span>
          </NavLink>
          <NavLink 
            to="/dashboard/sertifikasi" 
            end
            className={() => `menu-item ${location.pathname === '/dashboard/sertifikasi' || (location.pathname.includes('/sertifikasi/capa') && (location.pathname.endsWith('/pdf') || location.pathname.endsWith('/view')) && !location.search.includes('from=antrean')) ? 'active' : ''}`}
          >
            <span className="menu-icon">📜</span>
            <span className="menu-text">Sertifikasi</span>
          </NavLink>
          <NavLink 
            to="/dashboard/inspeksi" 
            end
            className={() => `menu-item ${location.pathname === '/dashboard/inspeksi' || (location.pathname.includes('/inspeksi/capa') && (location.pathname.endsWith('/pdf') || location.pathname.endsWith('/view')) && !location.search.includes('from=antrean')) ? 'active' : ''}`}
          >
            <span className="menu-icon">🔍</span>
            <span className="menu-text">Inspeksi</span>
          </NavLink>
          <NavLink to="/dashboard/informasi" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <span className="menu-icon">📊</span>
            <span className="menu-text">Informasi</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>

          <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isLightMode ? '🌙' : '☀️'}
            </button>
            <button
              className="user-profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar" style={{ background: '#8b5cf6' }}>
                👤
              </div>
              <div className="user-info">
                <p className="user-name">{user?.nama || user?.name || 'Supervisor'}</p>
                <p className="user-role">
                  Supervisor
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="profile-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => navigate('/dashboard/profile')}
                >
                  <span className="dropdown-icon">⚙️</span> Edit Profile
                </div>
                <div className="dropdown-divider"></div>
                <button className="logout-btn" onClick={handleLogout}>
                  <span className="dropdown-icon">🚪</span> Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="dashboard-content-scroll">
          <main className="dashboard-page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
