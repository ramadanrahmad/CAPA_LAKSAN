import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sertifikasiAPI, inspeksiAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function PermohonanSaya() {
  const navigate = useNavigate();
  const [permohonan, setPermohonan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedItem, setSelectedItem] = useState(null); // For detail modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resSertifikasi, resInspeksi] = await Promise.all([
        sertifikasiAPI.getMyPermohonan(),
        inspeksiAPI.getMyPermohonan()
      ]);

      let combinedData = [];

      if (resSertifikasi.data.success) {
        const sertifikasiData = resSertifikasi.data.data.map(item => {
          let displayStatus = item.status;
          if (item.status === 'Menunggu Evaluasi') displayStatus = 'Perlu Evaluasi';
          else if (item.status === 'Perlu Evaluasi') displayStatus = 'Menunggu Evaluasi';

          return {
            ...item,
            originalStatus: item.status,
            status: displayStatus,
            type: 'sertifikasi',
            displayId: `BPOMSTF${item.id}`,
            jenis_layanan: 'Sertifikasi',
            jenis_sarana_display: item.jenis_komoditi // map jenis_komoditi to be displayed in the same column
          };
        });
        combinedData = [...combinedData, ...sertifikasiData];
      }

      if (resInspeksi.data.success) {
        const inspeksiData = resInspeksi.data.data.map(item => {
          let displayStatus = item.status;
          if (item.status === 'Menunggu Penjadwalan') displayStatus = 'Menunggu Persetujuan';
          else if (item.status === 'Menunggu Evaluasi') displayStatus = 'Perlu Evaluasi';
          else if (item.status === 'Perlu Evaluasi') displayStatus = 'Menunggu Evaluasi';

          return {
            ...item,
            originalStatus: item.status,
            status: displayStatus,
            type: 'inspeksi',
            displayId: `BPOMINS${item.id}`,
            jenis_layanan: 'Pemeriksaan Sarana',
            jenis_sarana_display: item.jenis_sarana
          };
        });
        combinedData = [...combinedData, ...inspeksiData];
      }

      // Sort by created_at descending (newest first)
      combinedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setPermohonan(combinedData);
    } catch (error) {
      toast.error('Gagal mengambil data permohonan.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Menunggu Persetujuan':
        return 'badge-teal';
      case 'Persetujuan Diterima':
        return 'badge-yellow';
      case 'Menunggu Evaluasi': return 'badge-red';
      case 'Perlu Evaluasi': return 'badge-brown';
      case 'Upload File': return 'badge-blue';
      case 'Ditolak': return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredData = permohonan.filter(item => {
    if (item.status === 'Sertifikasi Selesai' || item.status === 'Inspeksi Selesai' || item.status === 'Pemeriksaan Selesai') return false;
    const matchesSearch = item.displayId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nama_sarana.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Semua' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="permohonan-saya-page">
      <div className="permohonan-header">
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Permohonan Saya</h1>
      </div>

      <div className="table-card">
        <div className="table-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari ID Sarana..." 
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
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Ditolak">Ditolak</option>
              <option value="Menunggu Evaluasi">Menunggu Evaluasi</option>
              <option value="Perlu Evaluasi">Perlu Evaluasi</option>
              <option value="Upload File">Menunggu Surat</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="bpom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No.</th>
                <th>ID Sarana</th>
                <th>Jenis</th>
                <th>Jenis Komoditi / Sarana</th>
                <th>Tanggal pengajuan</th>
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data permohonan.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>{index + 1}</td>
                    <td>{item.displayId}</td>
                    <td>{item.jenis_layanan}</td>
                    <td>{item.jenis_sarana_display}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.penanggung_jawab_nama || '-'}</td>
                    <td>
                      <span className={`status-badge ${item.status === 'Upload File' ? 'badge-blue' : getStatusBadgeClass(item.status)}`}>
                        {item.status === 'Upload File' ? 'Menunggu Surat' : item.status}
                      </span>
                    </td>
                    <td>
                      {item.type === 'sertifikasi' ? (
                        item.originalStatus === 'Menunggu Evaluasi' ? (
                          <button className="btn-aksi" style={{ background: '#8b5cf6' }} onClick={() => navigate(`/dashboard/sertifikasi/capa/${item.id}/edit-pelaku`)}>
                            Edit
                          </button>
                        ) : item.originalStatus === 'Perlu Evaluasi' ? (
                          <button className="btn-aksi" onClick={() => navigate(`/dashboard/sertifikasi/capa/${item.id}/view`)}>
                            Lihat Detail
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )
                      ) : item.type === 'inspeksi' ? (
                        item.originalStatus === 'Menunggu Evaluasi' ? (
                          <button className="btn-aksi" style={{ background: '#8b5cf6' }} onClick={() => navigate(`/dashboard/inspeksi/capa/${item.id}/edit-pelaku`)}>
                            Edit
                          </button>
                        ) : (item.originalStatus === 'Perlu Evaluasi' || item.originalStatus === 'Upload File') ? (
                          <button className="btn-aksi" onClick={() => navigate(`/dashboard/inspeksi/capa/${item.id}/view`)}>
                            Lihat Detail
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-aksi" style={{ background: '#3b82f6' }} onClick={() => setSelectedItem(item)}>
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
            
            <h2 style={{ marginTop: 0, marginBottom: '25px', color: 'var(--text-primary)' }}>Informasi Sarana ({selectedItem.displayId})</h2>
            
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
                    <label>Nama Petugas</label>
                    <input type="text" className="glass-input" value={selectedItem.penanggung_jawab_nama} disabled />
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
                    <input type="text" className="glass-input" value={selectedItem.jenis_sarana_display} disabled />
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
