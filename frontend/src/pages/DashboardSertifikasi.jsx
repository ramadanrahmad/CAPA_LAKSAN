import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { sertifikasiAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function DashboardSertifikasi() {
  const { fetchStats } = useOutletContext() || {};
  const navigate = useNavigate();
  const [permohonan, setPermohonan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal State
  const [selectedPermohonan, setSelectedPermohonan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('action');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await sertifikasiAPI.getPermohonanByPetugas();
      if (res.data.success) {
        setPermohonan(res.data.data);
      }
      if (fetchStats) fetchStats(); // Update stats in layout
    } catch (error) {
      toast.error('Gagal mengambil data antrean permohonan.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Menunggu Persetujuan': return 'badge-teal';
      case 'Persetujuan Diterima': return 'badge-yellow';
      case 'Menunggu Evaluasi': return 'badge-red';
      case 'Perlu Evaluasi': return 'badge-brown';
      case 'Ditolak': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredData = permohonan.filter(item => {
    if (item.status === 'Ditolak' || item.status === 'Sertifikasi Selesai') return false; 
    const idBPOM = `BPOMSTF${item.id}`;
    const matchesSearch = idBPOM.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nama_sarana.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Semua' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const openModal = (item, type = 'action') => {
    if (item.status === 'Menunggu Evaluasi' && type === 'action') {
      navigate(`/dashboard/sertifikasi/capa/${item.id}/view?from=antrean`);
      return;
    }
    setSelectedPermohonan(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPermohonan(null);
  };

  const handleTolak = async () => {
    if (!selectedPermohonan) return;
    try {
      setIsUpdating(true);
      const res = await sertifikasiAPI.updateStatus(selectedPermohonan.id, 'Ditolak');
      if (res.data.success) {
        toast.success('Permohonan berhasil ditolak.');
        closeModal();
        fetchData();
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menolak permohonan.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTerima = () => {
    if (!selectedPermohonan) return;
    // Arahkan ke halaman form CAPA
    navigate(`/dashboard/sertifikasi/capa/${selectedPermohonan.id}`);
  };

  return (
    <div className="antrean-sertifikasi">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Antrean Sertifikasi</h2>
      </div>

      <div className="table-card">
        <div className="table-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari ID Sarana atau Nama Sarana..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="table-input"
            />
          </div>
          <div className="filter-box">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="table-input"
            >
              <option value="Semua">Filter Status...</option>
              <option value="Menunggu Persetujuan">Perlu Persetujuan</option>

              <option value="Menunggu Evaluasi">Menunggu Evaluasi</option>
              <option value="Perlu Evaluasi">Perlu Evaluasi</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="bpom-table">
            <thead>
              <tr>
                <th>No</th>
                <th>ID Sarana</th>
                <th>Jenis Komoditi</th>
                <th>Nama Sarana</th>
                <th>Tanggal Pengajuan</th>
                <th>Petugas</th>
                <th>Status</th>
                <th>Aksi</th>
                <th>Informasi Sarana</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Memuat data antrean...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada antrean.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>BPOMSTF{item.id}</td>
                    <td>{item.jenis_komoditi}</td>
                    <td>{item.nama_sarana}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.penanggung_jawab_nama}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                        {item.status === 'Menunggu Persetujuan' ? 'Perlu Persetujuan' : item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {item.status === 'Perlu Evaluasi' ? (
                          <button className="btn-aksi" style={{ background: '#8b5cf6' }} onClick={() => navigate(`/dashboard/sertifikasi/capa/${item.id}/edit-petugas`)}>Edit</button>
                        ) : (
                          <button className="btn-aksi" style={{ background: '#10b981' }} onClick={() => openModal(item, 'action')}>Lihat Detail</button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className="btn-aksi" style={{ background: '#3b82f6' }} onClick={() => openModal(item, 'info')}>Lihat Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Permohonan */}
      {isModalOpen && selectedPermohonan && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" style={{
            background: 'var(--dropdown-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--dash-glass-border)',
            borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '950px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', position: 'relative'
          }}>
            <button className="modal-close" onClick={closeModal} style={{
              position: 'absolute', top: '15px', right: '20px', background: 'transparent',
              border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)'
            }}>×</button>
            
            <h2 style={{ marginTop: 0, marginBottom: '25px', color: 'var(--text-primary)' }}>Informasi Sarana (BPOMSTF{selectedPermohonan.id})</h2>
            
            <div className="sertifikasi-grid" style={{ marginBottom: '30px' }}>
              <div className="form-column">
                <div className="input-group">
                  <label>Nama Sarana</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.nama_sarana} disabled />
                </div>
                <div className="input-group">
                  <label>Alamat Sarana</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.alamat_sarana} disabled />
                </div>
                <div className="input-group">
                  <label>No. Telpon/HP</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.no_hp} disabled />
                </div>
                <div className="input-group">
                  <label>E-mail Sarana</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.email_sarana} disabled />
                </div>
              </div>
              <div className="form-column">
                <div className="input-group">
                  <label>Petugas</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.penanggung_jawab_nama} disabled />
                </div>
                <div className="input-group">
                  <label>Tanggal Pemeriksaan Oleh Petugas</label>
                  <input type="text" className="glass-input" value={formatDate(selectedPermohonan.tanggal_pemeriksaan)} disabled />
                </div>
                <div className="input-group">
                  <label>Tanggal Terima Surat</label>
                  <input type="text" className="glass-input" value={formatDate(selectedPermohonan.tanggal_terima)} disabled />
                </div>
                <div className="input-group">
                  <label>Kabupaten/Kota</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.kabupaten_kota} disabled />
                </div>
              </div>
              <div className="form-column">
                <div className="input-group">
                  <label>Jenis Komoditi</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.jenis_komoditi} disabled />
                </div>
              </div>
            </div>

            {modalType === 'action' && selectedPermohonan.status === 'Menunggu Persetujuan' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button 
                  onClick={handleTolak} 
                  disabled={isUpdating}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', border: '1px solid #ef4444',
                    background: 'transparent', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer',
                    opacity: isUpdating ? 0.7 : 1
                  }}>
                  Tolak
                </button>
                <button 
                  onClick={handleTerima} 
                  disabled={isUpdating}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                    background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    opacity: isUpdating ? 0.7 : 1
                  }}>
                  Terima
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
