import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function EditProfile() {
  const { user, login } = useAuth(); // We use login to update context if needed or just reload profile
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || user?.nama || '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isPetugas = user?.role === 'petugas';
  const isVerified = user?.email_verified === 1 || user?.email_verified === true;

  // Email verification is now handled in Dashboard.jsx

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }

    setIsLoading(true);
    try {
      await authAPI.updateProfile({ name: formData.name, password: formData.password });
      toast.success('Profil berhasil diperbarui!');
      
      // Update local context
      const newUserData = { ...user, name: formData.name, nama: formData.name };
      // To properly refresh, we could just reload the window or refetch profile
      window.location.reload();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)', color: 'var(--text-primary)', padding: '30px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--dash-glass-border)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--accent-color)' }}>Edit Profile</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Perbarui informasi pribadi dan keamanan Anda</p>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--dash-glass-border)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          Kembali
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--dash-glass-bg)', border: '1px solid var(--dash-glass-border)', borderRadius: '12px', padding: '30px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Read-only Information */}
          <div style={{ padding: '15px', background: 'var(--dash-glass-hover)', borderRadius: '8px', border: '1px solid var(--dash-glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{user?.email || '-'}</p>
                
                {!isPetugas && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isVerified ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        ✓ Terverifikasi
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        ⚠️ Belum Diverifikasi
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ padding: '15px', background: 'var(--dash-glass-hover)', borderRadius: '8px', border: '1px solid var(--dash-glass-border)' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role</p>
            <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'capitalize' }}>
              {user?.role === 'petugas' ? user?.petugas_role : 'Pelaku Usaha'}
            </p>
          </div>

          {user?.role === 'petugas' && (
            <div style={{ padding: '15px', background: 'var(--dash-glass-hover)', borderRadius: '8px', border: '1px solid var(--dash-glass-border)' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>NIP Petugas</p>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{user?.nip}</p>
            </div>
          )}

          {/* Editable Fields */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nama Lengkap</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--dash-glass-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ padding: '20px', background: 'var(--dash-glass-hover)', borderRadius: '8px', border: '1px solid var(--dash-glass-border)', marginTop: '10px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Ubah Kata Sandi</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Kosongkan jika tidak ingin mengubah kata sandi.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password Baru</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--dash-glass-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  placeholder="********"
                />
              </div>
              
              {formData.password && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--dash-glass-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                    placeholder="********"
                  />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: isLoading ? 'wait' : 'pointer', marginTop: '10px', transition: 'background 0.2s' }}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
