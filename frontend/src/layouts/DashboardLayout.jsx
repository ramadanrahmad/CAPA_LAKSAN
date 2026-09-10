import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/Toast';
import '../assets/dashboard.css';

export default function DashboardLayout() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isLightMode, setIsLightMode] = useState(localStorage.getItem('theme') !== 'dark');
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
    toast.success('Berhasil keluar');
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#f3f4f6' }}>
        <div style={{ fontSize: '1.5rem', color: '#1f2937' }}>Memuat Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
          <NavLink to="/dashboard" end className={() => `menu-item ${location.pathname === '/dashboard' || location.pathname === '/dashboard/sertifikasi/baru' || location.pathname === '/dashboard/inspeksi/baru' ? 'active' : ''}`}>
            <span className="menu-icon">🏠</span>
            <span className="menu-text">Beranda</span>
          </NavLink>
          <NavLink to="/dashboard/permohonan" className={() => `menu-item ${location.pathname === '/dashboard/permohonan' || location.pathname.includes('/capa/') ? 'active' : ''}`}>
            <span className="menu-icon">📄</span>
            <span className="menu-text">Permohonan Saya</span>
          </NavLink>
          <NavLink to="/dashboard/sertifikasi" end className={() => `menu-item ${location.pathname === '/dashboard/sertifikasi' ? 'active' : ''}`}>
            <span className="menu-icon">📜</span>
            <span className="menu-text">Sertifikasi</span>
          </NavLink>
          <NavLink to="/dashboard/inspeksi" end className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <span className="menu-icon">🔍</span>
            <span className="menu-text">Pemeriksaan Sarana</span>
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
              <div className="user-avatar">
                {user.role === 'petugas' ? '👮' : '👤'}
              </div>
              <div className="user-info">
                <p className="user-name">{user.name}</p>
                <p className="user-role">
                  {user.role === 'petugas' ? `Petugas (${user.nip})` : 'Pelaku Usaha'}
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

          {/* Footer */}
          <footer className="dashboard-footer">
            <div className="footer-columns">
              <div className="footer-col">
                <h4>Quick Links</h4>
                <ul>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Beranda</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/permohonan')}>Permohonan Saya</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/sertifikasi')}>Sertifikasi</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/inspeksi')}>Pemeriksaan Sarana</li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Contact Info</h4>
                <ul>
                  <li style={{ display: 'flex', gap: '10px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    <span>📞</span> 0821-2158-1271
                  </li>
                  <li style={{ display: 'flex', gap: '10px', color: 'var(--text-muted)' }}>
                    <span>✉️</span> layanan@bpom.go.id
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              LAKSAN BBPOM Palembang &copy; 2026. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
