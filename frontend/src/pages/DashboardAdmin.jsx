import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [petugasList, setPetugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, nip: '', nama: '', email: '', role: 'sertifikasi' });

  const fetchPetugas = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getAllPetugas();
      setPetugasList(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data petugas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPetugas();
  }, []);

  const handleEdit = (p) => {
    setFormData({ id: p.id, nip: p.nip, nama: p.nama, email: p.email || '', role: p.role });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus akun ini?')) {
      try {
        await adminAPI.deletePetugas(id);
        toast.success('Akun berhasil dihapus');
        fetchPetugas();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus akun');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await adminAPI.updatePetugas(formData.id, formData);
        toast.success('Akun berhasil diperbarui');
      } else {
        await adminAPI.createPetugas(formData);
        toast.success('Akun berhasil ditambahkan. Email verifikasi bisa digunakan melalui Lupa Password.');
      }
      setShowForm(false);
      fetchPetugas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Panel Administrator</h2>
        <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Manajemen Akun Petugas BPOM</p>
      </div>

      <div className="table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Daftar Petugas</h2>
          <button onClick={() => { setFormData({ id: null, nip: '', nama: '', email: '', role: 'sertifikasi' }); setShowForm(true); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Tambah Petugas
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--dash-glass-hover)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--dash-glass-border)' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>{formData.id ? 'Edit Petugas' : 'Tambah Petugas Baru'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>NIP</label>
                <input required value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--dash-glass-border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Nama Lengkap</label>
                <input required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--dash-glass-border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Alamat Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--dash-glass-border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--dash-glass-border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                  <option value="sertifikasi">Sertifikasi</option>
                  <option value="inspeksi">Inspeksi</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--dash-glass-border)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
              </div>
            </form>
          </div>
        )}

        <div className="table-responsive">
        <table className="bpom-table" style={{ whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              <th style={{ width: '150px' }}>NIP</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: '150px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td></tr> : 
             petugasList.map(p => (
              <tr key={p.id}>
                <td>{p.nip}</td>
                <td>{p.nama}</td>
                <td>{p.email || '-'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: p.role === 'admin' ? '#ef4444' : p.role === 'supervisor' ? '#8b5cf6' : p.role === 'sertifikasi' ? '#10b981' : '#f59e0b', color: 'white' }}>
                    {p.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEdit(p)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  {p.id !== user?.id && (
                    <button onClick={() => handleDelete(p.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}
