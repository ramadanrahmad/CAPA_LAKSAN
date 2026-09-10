import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supervisorAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function InspeksiSupervisor() {
  const navigate = useNavigate();
  const [permohonan, setPermohonan] = useState([]);
  const [allInspeksi, setAllInspeksi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await supervisorAPI.getAllAntrean();
      if (res.data.success) {
        const inspeksiOnly = res.data.data.filter(item => item.type === 'inspeksi');
        setAllInspeksi(inspeksiOnly);
        const selesaiOnly = inspeksiOnly.filter(item => item.status === 'Inspeksi Selesai' || item.status === 'Pemeriksaan Selesai');
        setPermohonan(selesaiOnly);
      }
    } catch (error) {
      toast.error('Gagal mengambil data inspeksi selesai.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDownloadCapa = (item) => {
    if (item.file_capa_ttd) {
      const envUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '';
      const backendUrl = '';
      const fileUrl = item.file_capa_ttd.startsWith('http') 
        ? item.file_capa_ttd 
        : backendUrl + item.file_capa_ttd.split(',')[0].trim();
      window.open(fileUrl, '_blank');
    } else {
      // Fallback for older entries without TTD
      navigate(`/dashboard/inspeksi/capa/${item.id}/pdf`);
    }
  };

  const antreanMasukCount = allInspeksi.filter(d => d.status === 'Menunggu Persetujuan' || d.status === 'Menunggu Penjadwalan').length;
  const perluEvaluasiCount = allInspeksi.filter(d => d.status === 'Perlu Evaluasi' || d.status === 'Menunggu Evaluasi' || d.status === 'Upload File').length;
  const selesaiCount = permohonan.length;

  return (
    <div className="sertifikasi-selesai-page">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '40px', borderBottom: '1px solid var(--dash-glass-border)', paddingBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Antrean Masuk</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{antreanMasukCount}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Sedang Diproses</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{perluEvaluasiCount}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Inspeksi Selesai</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{selesaiCount}</div>
        </div>
      </div>

      <div className="permohonan-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Riwayat Inspeksi Selesai</h2>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="bpom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No.</th>
                <th>ID Sarana</th>
                <th>Jenis Sarana</th>
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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td>
                </tr>
              ) : permohonan.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Belum ada inspeksi yang selesai.</td>
                </tr>
              ) : (
                permohonan.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>BPOMINS{item.id}</td>
                    <td>{item.jenis_sarana}</td>
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
                          onClick={() => handleDownloadCapa(item)}
                        >
                          Unduh CAPA
                        </button>
                        <button
                          className="btn-aksi"
                          style={{ background: '#f59e0b' }}
                          onClick={() => navigate(`/dashboard/inspeksi/capa/${item.id}/view`)}
                        >
                          Lihat Riwayat CAPA
                        </button>
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
            
            <h2 style={{ marginTop: 0, marginBottom: '25px', color: 'var(--text-primary)' }}>Informasi Sarana (BPOMINS{selectedItem.id})</h2>
            
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
                    <label>Jenis Sarana</label>
                    <input type="text" className="glass-input" value={selectedItem.jenis_sarana} disabled />
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
