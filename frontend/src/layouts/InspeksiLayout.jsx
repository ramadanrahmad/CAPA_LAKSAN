import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { inspeksiAPI } from '../services/api';

export default function InspeksiLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLightMode, setIsLightMode] = useState(localStorage.getItem('theme') !== 'dark');
  const [stats, setStats] = useState({ masuk: 0, revisi: 0, selesai: 0 });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== 'dark') {
      document.documentElement.classList.add('light-mode');
      setIsLightMode(true);
    } else {
      document.documentElement.classList.remove('light-mode');
      setIsLightMode(false);
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await inspeksiAPI.getPermohonanByPetugas();
      if (res.data.success) {
        const data = res.data.data;
        const masuk = data.filter(d => d.status === 'Menunggu Persetujuan' || d.status === 'Menunggu Penjadwalan').length;
        const revisi = data.filter(d => d.status === 'Perlu Evaluasi').length;
        const selesai = data.filter(d => d.status === 'Inspeksi Selesai' || d.status === 'Pemeriksaan Selesai').length;
        setStats({ masuk, revisi, selesai });
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

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
            className={() => `menu-item ${location.pathname === '/dashboard' || (location.pathname.includes('/inspeksi/capa') && (!location.pathname.endsWith('/pdf') && !location.pathname.endsWith('/view') || location.search.includes('from=antrean'))) ? 'active' : ''}`}
          >
            <span className="menu-icon">📥</span>
            <span className="menu-text">Antrean</span>
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
              <div className="user-avatar">
                👤
              </div>
              <div className="user-info">
                <p className="user-name">{user?.nama || user?.name || 'Petugas'}</p>
                <p className="user-role">
                  Petugas Inspeksi
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
            {/* Top Summary Stats */}
            {!location.pathname.includes('/capa') && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '40px', borderBottom: '1px solid var(--dash-glass-border)', paddingBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Antrean Masuk</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.masuk}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Perlu Evaluasi</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.revisi}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Inspeksi Selesai</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.selesai}</div>
                </div>
              </div>
            )}

            <Outlet context={{ fetchStats }} />
          </main>
        </div>
      </div>
    </div>
  );
}
