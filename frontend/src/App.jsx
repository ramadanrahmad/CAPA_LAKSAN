import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ToastContainer from './components/Toast';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

// Role-specific Dashboards
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardSertifikasi from './pages/DashboardSertifikasi';
import DashboardInspeksi from './pages/DashboardInspeksi';
import DashboardSupervisor from './pages/DashboardSupervisor';
import EditProfile from './pages/EditProfile';
import FormSertifikasi from './pages/FormSertifikasi';
import PermohonanSaya from './pages/PermohonanSaya';
import FormInspeksi from './pages/FormInspeksi';
import SertifikasiLayout from './layouts/SertifikasiLayout';
import SupervisorLayout from './layouts/SupervisorLayout';
import AdminLayout from './layouts/AdminLayout';
import FormCapaPetugas from './pages/FormCapaPetugas';
import FormCapaPelakuUsaha from './pages/FormCapaPelakuUsaha';
import SertifikasiSelesai from './pages/SertifikasiSelesai';
import SertifikasiSupervisor from './pages/SertifikasiSupervisor';
import InspeksiSupervisor from './pages/InspeksiSupervisor';
import InformasiSupervisor from './pages/InformasiSupervisor';
import PdfViewCapa from './pages/PdfViewCapa';
import InformasiPetugas from './pages/InformasiPetugas';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Inspeksi specifics
import InspeksiLayout from './layouts/InspeksiLayout';
import InspeksiSelesai from './pages/InspeksiSelesai';
import FormCapaPetugasInspeksi from './pages/FormCapaPetugasInspeksi';
import FormCapaPelakuUsahaInspeksi from './pages/FormCapaPelakuUsahaInspeksi';
import PdfViewCapaInspeksi from './pages/PdfViewCapaInspeksi';
import InformasiPetugasInspeksi from './pages/InformasiPetugasInspeksi';

// Dummy pages untuk fitur lain
const DummyPage = ({ title }) => (
  <div style={{ padding: '20px', background: 'var(--dash-glass-bg)', borderRadius: '12px', minHeight: '60vh' }}>
    <h2 style={{ color: 'var(--text-primary)' }}>Halaman {title}</h2>
    <p style={{ color: 'var(--text-muted)' }}>Fitur ini sedang dalam tahap pengembangan.</p>
  </div>
);

// Role Router
const RoleRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/auth" replace />;

  if (user.role === 'petugas') {
    if (user.petugas_role === 'admin') return <AdminLayout />;
    if (user.petugas_role === 'sertifikasi') return <SertifikasiLayout />;
    if (user.petugas_role === 'inspeksi') return <InspeksiLayout />;
    if (user.petugas_role === 'supervisor') return <SupervisorLayout />;
  }

  // Default for user (pelaku usaha)
  return <DashboardLayout />;
};

const DashboardIndex = () => {
  const { user } = useAuth();
  if (user?.role === 'petugas' && user?.petugas_role === 'sertifikasi') return <DashboardSertifikasi />;
  if (user?.role === 'petugas' && user?.petugas_role === 'inspeksi') return <DashboardInspeksi />;
  if (user?.role === 'petugas' && user?.petugas_role === 'admin') return <DashboardAdmin />;
  if (user?.role === 'petugas' && user?.petugas_role === 'supervisor') return <DashboardSupervisor />;
  return <Dashboard />;
};

const InformasiRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'petugas' && user?.petugas_role === 'inspeksi') return <InformasiPetugasInspeksi />;
  if (user?.role === 'petugas' && user?.petugas_role === 'supervisor') return <InformasiSupervisor />;
  return <InformasiPetugas />;
};

const SertifikasiSelesaiRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'petugas' && user?.petugas_role === 'supervisor') return <SertifikasiSupervisor />;
  return <SertifikasiSelesai />;
};

const InspeksiSelesaiRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'petugas' && user?.petugas_role === 'supervisor') return <InspeksiSupervisor />;
  return <InspeksiSelesai />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      {/* Top Level Profile Route */}
      <Route path="/dashboard/profile" element={user ? <EditProfile /> : <Navigate to="/auth" replace />} />
      
      {/* Dashboard Routes with Sidebar & Navbar */}
      <Route path="/dashboard" element={<RoleRouter />}>
        <Route index element={<DashboardIndex />} />
        <Route path="permohonan" element={<PermohonanSaya />} />
        <Route path="sertifikasi" element={<SertifikasiSelesaiRouter />} />
        <Route path="sertifikasi/baru" element={<FormSertifikasi />} />
        <Route path="sertifikasi/capa/:id" element={<FormCapaPetugas />} />
        <Route path="sertifikasi/capa/:id/view" element={<FormCapaPetugas />} />
        <Route path="sertifikasi/capa/:id/edit-petugas" element={<FormCapaPetugas />} />
        <Route path="sertifikasi/capa/:id/edit-pelaku" element={<FormCapaPelakuUsaha />} />
        <Route path="sertifikasi/capa/:id/pdf" element={<PdfViewCapa />} />
        <Route path="informasi" element={<InformasiRouter />} />
        
        {/* Inspeksi Routes */}
        <Route path="inspeksi" element={<InspeksiSelesaiRouter />} />
        <Route path="inspeksi/baru" element={<FormInspeksi />} />
        <Route path="inspeksi/capa/:id" element={<FormCapaPetugasInspeksi />} />
        <Route path="inspeksi/capa/:id/view" element={<FormCapaPetugasInspeksi />} />
        <Route path="inspeksi/capa/:id/edit-petugas" element={<FormCapaPetugasInspeksi />} />
        <Route path="inspeksi/capa/:id/edit-pelaku" element={<FormCapaPelakuUsahaInspeksi />} />
        <Route path="inspeksi/capa/:id/pdf" element={<PdfViewCapaInspeksi />} />

        <Route path="pesan" element={<DummyPage title="Pesan" />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== 'dark') {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
