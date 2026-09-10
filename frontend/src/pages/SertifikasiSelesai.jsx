import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sertifikasiAPI } from '../services/api';
import { toast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

export default function SertifikasiSelesai() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [permohonan, setPermohonan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      let res;
      if (user.role === 'petugas') {
        res = await sertifikasiAPI.getPermohonanByPetugas();
      } else {
        res = await sertifikasiAPI.getMyPermohonan();
      }

      if (res.data.success) {
        // Filter only Sertifikasi Selesai
        const selesaiData = res.data.data.filter(item => item.status === 'Sertifikasi Selesai');
        // Sort newest first
        selesaiData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPermohonan(selesaiData);
      }
    } catch (error) {
      toast.error('Gagal mengambil data sertifikasi selesai.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="sertifikasi-selesai-page">
      <div className="permohonan-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Sertifikasi Selesai</h2>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="bpom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No.</th>
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
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td>
                </tr>
              ) : permohonan.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Belum ada sertifikasi yang selesai.</td>
                </tr>
              ) : (
                permohonan.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>BPOMSTF{item.id}</td>
                    <td>{item.jenis_komoditi}</td>
                    <td>{item.nama_sarana}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.penanggung_jawab_nama || '-'}</td>
                    <td>
                      <span className="status-badge badge-teal">Selesai</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className="btn-aksi"
                          style={{ background: '#10b981' }}
                          onClick={() => navigate(`/dashboard/sertifikasi/capa/${item.id}/pdf`)}
                        >
                          Unduh CAPA
                        </button>
                        {user?.role === 'petugas' && (
                          <button
                            className="btn-aksi"
                            style={{ background: '#f59e0b' }}
                            onClick={() => navigate(`/dashboard/sertifikasi/capa/${item.id}/view`)}
                          >
                            Lihat Riwayat CAPA
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-aksi"
                        style={{ background: '#3b82f6' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'var(--dropdown-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--dash-glass-border)',
            borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '950px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', position: 'relative'
          }}>
            <button className="modal-close" onClick={() => setSelectedItem(null)} style={{
              position: 'absolute', top: '15px', right: '20px', background: 'transparent',
              border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)'
            }}>×</button>
            
            <h2 style={{ marginTop: 0, marginBottom: '25px', color: 'var(--text-primary)' }}>Informasi Sarana (BPOMSTF{selectedItem.id})</h2>
            
            <div className="modal-body">
              <div className="sertifikasi-grid" style={{ marginBottom: '30px' }}>
                <div className="form-column">
                  <div className="input-group">
                    <label>Nama Sarana</label>
                    <input type="text" className="glass-input" value={selectedItem.nama_sarana} disabled />
                  </div>
                  <div className="input-group">
                    <label>Alamat Sarana</label>
                    <input type="text" className="glass-input" value={selectedItem.alamat_sarana} disabled />
                  </div>
                  <div className="input-group">
                    <label>No. Telpon/HP</label>
                    <input type="text" className="glass-input" value={selectedItem.no_hp} disabled />
                  </div>
                  <div className="input-group">
                    <label>E-mail Sarana</label>
                    <input type="text" className="glass-input" value={selectedItem.email_sarana} disabled />
                  </div>
                </div>
                <div className="form-column">
                  <div className="input-group">
                    <label>Petugas</label>
                    <input type="text" className="glass-input" value={selectedItem.penanggung_jawab_nama || selectedItem.nama_pimpinan || '-'} disabled />
                  </div>
                  <div className="input-group">
                    <label>Tanggal Pemeriksaan Oleh Petugas</label>
                    <input type="text" className="glass-input" value={formatDate(selectedItem.tanggal_pemeriksaan)} disabled />
                  </div>
                  <div className="input-group">
                    <label>Tanggal Terima Surat</label>
                    <input type="text" className="glass-input" value={formatDate(selectedItem.tanggal_terima)} disabled />
                  </div>
                  <div className="input-group">
                    <label>Kabupaten/Kota</label>
                    <input type="text" className="glass-input" value={selectedItem.kabupaten_kota} disabled />
                  </div>
                </div>
                <div className="form-column">
                  <div className="input-group">
                    <label>Jenis Komoditi</label>
                    <input type="text" className="glass-input" value={selectedItem.jenis_komoditi} disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
