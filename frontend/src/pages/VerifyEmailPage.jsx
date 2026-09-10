import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;

    const verifyToken = async () => {
      try {
        const res = await authAPI.verifyEmail(token);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Email berhasil diverifikasi!');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Gagal memverifikasi email.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bg-orbs">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <div style={{ background: 'var(--dash-glass-bg)', border: '1px solid var(--dash-glass-border)', padding: '40px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {status === 'loading' && (
          <div>
            <div className="spinner" style={{ borderTopColor: '#38bdf8', width: '40px', height: '40px', margin: '0 auto 20px', borderWidth: '4px' }}></div>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Memverifikasi Email...</h2>
            <p style={{ color: 'var(--text-muted)' }}>Mohon tunggu sebentar.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="fade-in">
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
            <h2 style={{ margin: 0, color: '#10b981' }}>Verifikasi Berhasil!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>{message}</p>
            <button 
              onClick={() => navigate('/auth')}
              style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Lanjutkan ke Aplikasi
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="fade-in">
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>❌</div>
            <h2 style={{ margin: 0, color: '#ef4444' }}>Verifikasi Gagal</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>{message}</p>
            <button 
              onClick={() => navigate('/auth')}
              style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--dash-glass-border)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
