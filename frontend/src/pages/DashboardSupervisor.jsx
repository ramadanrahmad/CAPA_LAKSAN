import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supervisorAPI, sertifikasiAPI, inspeksiAPI, commonAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function DashboardSupervisor() {
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
  const [ttdFiles, setTtdFiles] = useState({});
  const [evaluasiDates, setEvaluasiDates] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await supervisorAPI.getAllAntrean();
      if (res.data.success) {
        setPermohonan(res.data.data);
      }
      if (fetchStats) fetchStats();
    } catch (error) {
      toast.error('Gagal mengambil data antrean permohonan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e, id) => {
    if (e.target.files.length > 0) {
      setTtdFiles({ ...ttdFiles, [id]: e.target.files[0] });
    }
  };

  const handleUploadTtd = async (item) => {
    const file = ttdFiles[item.id];
    if (!file) {
      toast.error('Pilih file terlebih dahulu.');
      return;
    }
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('files', file);
      
      const uploadRes = await commonAPI.uploadFile(formData);
      if (uploadRes.data.success) {
        const envUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '';
        const backendUrl = '';
        
        let urlString = '';
        if (uploadRes.data.fileUrls) {
          urlString = uploadRes.data.fileUrls.map(url => backendUrl + url).join(', ');
        }
        
        let res;
        if (item.type === 'sertifikasi') {
          res = await sertifikasiAPI.uploadTtd(item.id, urlString);
        } else {
          res = await inspeksiAPI.uploadTtd(item.id, urlString);
        }

        if (res.data.success) {
          toast.success('File TTD berhasil diunggah dan status diperbarui.');
          setTtdFiles(prev => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
          fetchData();
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah file TTD.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadEvaluasiFinal = async (item) => {
    const id = item.id;
    const file = ttdFiles[id];
    const date = item.tanggal_evaluasi || evaluasiDates[id];
    
    if (!file || !date) {
      toast.error('Pilih file dan isi tanggal terlebih dahulu.');
      return;
    }
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('files', file);
      
      const uploadRes = await commonAPI.uploadFile(formData);
      if (uploadRes.data.success) {
        const envUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '';
        const backendUrl = '';
        
        let urlString = '';
        if (uploadRes.data.fileUrls) {
          urlString = uploadRes.data.fileUrls.map(url => backendUrl + url).join(', ');
        }
          
        const payloadFinal = { tanggal_evaluasi: date, file_evaluasi: urlString };
        const res = await inspeksiAPI.submitEvaluasiCapa(id, payloadFinal);
        if (res.data.success) {
          toast.success('Evaluasi Final berhasil dikirim ke Pelaku Usaha.');
          setTtdFiles(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
          setEvaluasiDates(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
          fetchData();
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Menunggu Persetujuan': return 'badge-teal';
      case 'Menunggu Penjadwalan': return 'badge-teal';
      case 'Persetujuan Diterima': return 'badge-yellow';
      case 'Menunggu Evaluasi': return 'badge-red';
      case 'Perlu Evaluasi': return 'badge-brown';
      case 'Upload File': return 'badge-blue';
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
    // Filter out finished items
    if (item.status === 'Ditolak' || item.status === 'Sertifikasi Selesai' || item.status === 'Inspeksi Selesai' || item.status === 'Pemeriksaan Selesai') return false; 
    
    const prefix = item.type === 'sertifikasi' ? 'BPOMSTF' : 'BPOMINS';
    const idDisplay = `${prefix}${item.id}`;
    
    const matchesSearch = idDisplay.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nama_sarana.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Semua' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getUrlPrefix = (type) => {
    return type === 'sertifikasi' ? '/dashboard/sertifikasi/capa' : '/dashboard/inspeksi/capa';
  };

  const openModal = (item, type = 'action') => {
    if ((item.status === 'Menunggu Evaluasi' || item.status === 'Upload File') && type === 'action') {
      navigate(`${getUrlPrefix(item.type)}/${item.id}/view?from=antrean`);
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
      const apiToUse = selectedPermohonan.type === 'sertifikasi' ? sertifikasiAPI : inspeksiAPI;
      const res = await apiToUse.updateStatus(selectedPermohonan.id, 'Ditolak');
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
    navigate(`${getUrlPrefix(selectedPermohonan.type)}/${selectedPermohonan.id}`);
  };

  // Hitung jumlah untuk card summary
  const antreanMasukCount = filteredData.filter(d => d.status === 'Menunggu Persetujuan' || d.status === 'Menunggu Penjadwalan').length;
  const perluEvaluasiCount = filteredData.filter(d => d.status === 'Perlu Evaluasi' || d.status === 'Upload File').length;
  const menungguEvaluasiCount = filteredData.filter(d => d.status === 'Menunggu Evaluasi').length;
  // Get all completed from permohonan data (we need to adjust fetchData or fetch separately if we want total completed, but supervisorAPI.getAllAntrean() might not include completed if we filter them out)
  // Wait, in filteredData they are excluded, but in permohonan they might exist.
  const sertifikasiSelesaiCount = permohonan.filter(d => d.type === 'sertifikasi' && d.status === 'Sertifikasi Selesai').length;
  const inspeksiSelesaiCount = permohonan.filter(d => d.type === 'inspeksi' && (d.status === 'Inspeksi Selesai' || d.status === 'Pemeriksaan Selesai')).length;

  return (
    <div className="dashboard-sertifikasi-page">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '40px', borderBottom: '1px solid var(--dash-glass-border)', paddingBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Antrean Masuk</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{antreanMasukCount}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Sedang Diproses</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{perluEvaluasiCount + menungguEvaluasiCount}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Sertifikasi Selesai</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{sertifikasiSelesaiCount}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Inspeksi Selesai</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{inspeksiSelesaiCount}</div>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Seluruh Antrean Sarana</h2>
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
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>

              <option value="Menunggu Evaluasi">Menunggu Evaluasi</option>
              <option value="Perlu Evaluasi">Perlu Evaluasi</option>
              <option value="Upload File">Upload File</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="bpom-table">
            <thead>
              <tr>
                <th>No</th>
                <th>ID Sarana</th>
                <th>Layanan</th>
                <th>Jenis Sarana/Komoditi</th>
                <th>Nama Sarana</th>
                <th>Tanggal Pengajuan</th>
                <th>Petugas</th>
                <th>Status</th>
                <th>Aksi</th>
                <th>Informasi Sarana</th>
                <th>Upload File</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Memuat data antrean...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada antrean.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>{index + 1}</td>
                    <td>{item.type === 'sertifikasi' ? 'BPOMSTF' : 'BPOMINS'}{item.id}</td>
                    <td><span style={{ padding: '4px 8px', borderRadius: '4px', background: item.type === 'sertifikasi' ? '#38bdf8' : '#8b5cf6', color: 'white', fontSize: '0.8rem' }}>{item.type.toUpperCase()}</span></td>
                    <td>{item.type === 'sertifikasi' ? item.jenis_komoditi : item.jenis_sarana}</td>
                    <td>{item.nama_sarana}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.penanggung_jawab_nama || '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                        {item.status === 'Menunggu Persetujuan' || item.status === 'Menunggu Penjadwalan' ? 'Perlu Persetujuan' : item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {item.status === 'Perlu Evaluasi' ? (
                          <button className="btn-aksi" style={{ background: '#8b5cf6' }} onClick={() => navigate(`${getUrlPrefix(item.type)}/${item.id}/edit-petugas`)}>Edit</button>
                        ) : item.type === 'inspeksi' && item.status === 'Upload File' ? (
                          <>
                            <button className="btn-aksi" style={{ background: '#10b981' }} onClick={() => navigate(`${getUrlPrefix(item.type)}/${item.id}/view`)}>Lihat Detail</button>
                            <button className="btn-aksi" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => navigate(`/dashboard/inspeksi/capa/${item.id}/pdf`)}>Unduh File</button>
                          </>
                        ) : item.status === 'Upload File' ? (
                          <button className="btn-aksi" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => navigate(`${getUrlPrefix(item.type)}/${item.id}/pdf`)}>Unduh CAPA</button>
                        ) : (
                          <button className="btn-aksi" style={{ background: '#10b981' }} onClick={() => openModal(item, 'action')}>Lihat Detail</button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className="btn-aksi" style={{ background: '#3b82f6' }} onClick={() => openModal(item, 'info')}>Lihat Detail</button>
                    </td>
                    <td>
                      {item.type === 'inspeksi' && item.status === 'Upload File' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {!item.tanggal_evaluasi && (
                            <input type="date" value={evaluasiDates[item.id] || ''} onChange={(e) => setEvaluasiDates({...evaluasiDates, [item.id]: e.target.value})} style={{ fontSize: '0.8rem', padding: '2px' }} />
                          )}
                          <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, item.id)} style={{ fontSize: '0.8rem' }} />
                          <button className="btn-aksi" style={{ background: '#3b82f6', padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleUploadEvaluasiFinal(item)} disabled={isUpdating}>
                            {isUpdating ? 'Mengirim...' : 'Kirim Evaluasi'}
                          </button>
                        </div>
                      ) : item.type === 'sertifikasi' && item.status === 'Upload File' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <input type="file" onChange={(e) => handleFileChange(e, item.id)} style={{ fontSize: '0.8rem' }} />
                          <button className="btn-aksi" style={{ background: '#10b981', padding: '4px 8px', fontSize: '0.8rem', color: '#fff' }} onClick={() => handleUploadTtd(item)} disabled={isUpdating}>
                            {isUpdating ? 'Mengirim...' : 'Kirim TTD'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
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
            
            <h2 style={{ marginTop: 0, marginBottom: '25px', color: 'var(--text-primary)' }}>
              Informasi Sarana ({selectedPermohonan.type === 'sertifikasi' ? 'BPOMSTF' : 'BPOMINS'}{selectedPermohonan.id})
            </h2>
            
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
                  <input type="text" className="glass-input" value={selectedPermohonan.penanggung_jawab_nama || selectedPermohonan.nama_pimpinan || '-'} disabled />
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
                  <label>{selectedPermohonan.type === 'sertifikasi' ? 'Jenis Komoditi' : 'Jenis Sarana'}</label>
                  <input type="text" className="glass-input" value={selectedPermohonan.type === 'sertifikasi' ? selectedPermohonan.jenis_komoditi : selectedPermohonan.jenis_sarana} disabled />
                </div>
              </div>
            </div>

            {modalType === 'action' && selectedPermohonan.status !== 'Menunggu Evaluasi' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--dash-glass-border)' }}>
                <button 
                  onClick={handleTolak} 
                  disabled={isUpdating}
                  className="btn-tolak"
                  style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isUpdating ? 'Memproses...' : 'Tolak'}
                </button>
                <button 
                  onClick={handleTerima} 
                  disabled={isUpdating}
                  className="btn-terima"
                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isUpdating ? 'Memproses...' : 'Terima'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
