import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { sertifikasiAPI, inspeksiAPI, authAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ perluEvaluasi: 0, sertifikasi: 0, pemeriksaanSarana: 0 });
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await authAPI.resendVerification({ email: user?.email });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim ulang email verifikasi.');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [resSertifikasi, resInspeksi] = await Promise.all([
        sertifikasiAPI.getMyPermohonan(),
        inspeksiAPI.getMyPermohonan()
      ]);

      let perluEvaluasi = 0;
      let sertifikasi = 0;
      let pemeriksaanSarana = 0;

      if (resSertifikasi.data.success) {
        const data = resSertifikasi.data.data;
        perluEvaluasi += data.filter(d => d.status === 'Menunggu Evaluasi').length;
        sertifikasi += data.filter(d => d.status === 'Sertifikasi Selesai').length;
      }

      if (resInspeksi.data.success) {
        const data = resInspeksi.data.data;
        perluEvaluasi += data.filter(d => d.status === 'Menunggu Evaluasi').length;
        pemeriksaanSarana += data.filter(d => d.status === 'Inspeksi Selesai' || d.status === 'Pemeriksaan Selesai').length;
      }

      setStats({ perluEvaluasi, sertifikasi, pemeriksaanSarana });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const isVerified = user?.email_verified === 1 || user?.email_verified === true;

  const handleCreateSertifikasi = () => {
    if (!isVerified) {
      toast.error('Silakan verifikasi email Anda terlebih dahulu.');
      return;
    }
    navigate('/dashboard/sertifikasi/baru');
  };

  const handleCreateInspeksi = () => {
    if (!isVerified) {
      toast.error('Silakan verifikasi email Anda terlebih dahulu.');
      return;
    }
    navigate('/dashboard/inspeksi/baru');
  };

  const displayName = user?.name || 'Pengguna';

  return (
    <div>
      <div className="welcome-header">
        <h1>Selamat Datang, {displayName}!</h1>
      </div>

      {!isVerified && user?.role !== 'petugas' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '15px 25px',
          borderRadius: '12px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚠️</span>
            <div>
              <strong style={{ display: 'block', color: '#ef4444', marginBottom: '5px', fontSize: '1.1rem' }}>Email Anda belum diverifikasi!</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Anda tidak dapat membuat permohonan baru sebelum email diverifikasi. Silakan cek kotak masuk atau folder spam email Anda.</span>
            </div>
          </div>
          <button 
            onClick={handleResend}
            disabled={isResending}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: isResending ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: isResending ? 0.7 : 1,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {isResending ? 'Mengirim Ulang...' : 'Kirim Ulang Email'}
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="status-cards">
          <div className="status-card">
            <div className="status-info">
              <div className="title">Perlu Evaluasi</div>
              <div className="value">{stats.perluEvaluasi}</div>
            </div>
          </div>
          
          <div className="status-card">
            <div className="status-info">
              <div className="title">Sertifikasi</div>
              <div className="value">{stats.sertifikasi}</div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-info">
              <div className="title">Pemeriksaan Sarana</div>
              <div className="value">{stats.pemeriksaanSarana}</div>
            </div>
          </div>
        </div>

        <div className="hero-banner">

          <div className="hero-content">
            <div className="hero-text">
              <h2>Informasi Dasar Mengenai CAPA Sertifikasi dan CAPA Pemeriksaan Sarana (Rutin)</h2>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)' }}>🔹 CAPA Sertifikasi</strong>
                <p style={{ margin: 0, lineHeight: '1.5', color: 'var(--text-muted)' }}>
                  Sertifikasi BPOM merupakan proses penilaian dan verifikasi terhadap produk dan dokumen untuk memastikan keamanan, mutu dan kepatuhan terhadap peraturan yang berlaku sebelum diedarkan ke masyarakat.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)' }}>🔹 CAPA Pemeriksaan Sarana (Rutin)</strong>
                <p style={{ margin: 0, lineHeight: '1.5', color: 'var(--text-muted)' }}>
                  Pemeriksaan Sarana (Rutin) BPOM adalah evaluasi berkala pada fasilitas produksi maupun distribusi obat dan makanan. Ini bertujuan untuk memastikan kepatuhan yang berkelanjutan terhadap standar Cara Pembuatan yang Baik (CPOB/CPPOB) demi menjamin mutu produk yang beredar di pasaran.
                </p>
              </div>
              
              <div className="hero-tips">
                <span style={{ fontSize: '1.5rem' }}>💡</span>
                <div>
                  <strong>TIPS:</strong> Segera selesaikan tindak lanjut CAPA Anda dalam batas waktu yang ditentukan agar proses pengajuan Anda dapat segera difinalisasi oleh petugas.
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-actions">
            <button 
              className="btn-action btn-sertifikasi" 
              onClick={handleCreateSertifikasi}
            >
              CAPA SERTIFIKASI
            </button>
            <button 
              className="btn-action btn-inspeksi" 
              onClick={handleCreateInspeksi}
            >
              CAPA PEMERIKSAAN SARANA (RUTIN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
