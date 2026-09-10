import { useState, useEffect } from 'react';
import { sertifikasiAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function InformasiPetugas() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await sertifikasiAPI.getInformasiPetugas();
      if (res.data.success) {
        setData(res.data.data);
        setFilteredData(res.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data informasi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = data;

    if (searchTerm) {
      result = result.filter(item => 
        item.nama_sarana.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (startDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.tanggal_surat_tl || item.tanggal_pemeriksaan);
        return itemDate >= new Date(startDate);
      });
    }

    if (endDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.tanggal_surat_tl || item.tanggal_pemeriksaan);
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return itemDate <= end;
      });
    }

    setFilteredData(result);
  }, [searchTerm, startDate, endDate, data]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="sertifikasi-page">
      <div className="permohonan-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Informasi CAPA Sertifikasi</h2>
      </div>

      {/* Filter Section */}
      <div className="filter-section" style={{ 
        display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap',
        background: 'var(--card-bg)', padding: '20px', borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pencarian</label>
          <input 
            type="text" 
            placeholder="Cari Nama Sarana..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 15px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mulai Dari</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ 
              padding: '10px 15px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sampai Dengan</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ 
              padding: '10px 15px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
            style={{
              padding: '10px 15px', borderRadius: '8px', background: 'transparent',
              border: '1px solid var(--text-muted)', color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="bpom-table" style={{ whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th rowSpan="2" style={{ width: '50px' }}>No</th>
                <th rowSpan="2">Nama Sarana</th>
                <th rowSpan="2">Alamat</th>
                <th rowSpan="2">Tanggal Periksa Sarana</th>
                <th rowSpan="2">Tanggal Terima Surat</th>
                <th rowSpan="2">Tanggal Surat TL</th>
                <th rowSpan="2">Tanggal CAPA</th>
                <th colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>Temuan</th>
                <th colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>Evaluasi CAPA</th>
              </tr>
              <tr>
                <th style={{ textAlign: 'center' }}>Minor</th>
                <th style={{ textAlign: 'center' }}>Mayor</th>
                <th style={{ textAlign: 'center' }}>Serius</th>
                <th style={{ textAlign: 'center' }}>Kritikal</th>
                <th style={{ textAlign: 'center' }}>Minor</th>
                <th style={{ textAlign: 'center' }}>Mayor</th>
                <th style={{ textAlign: 'center' }}>Serius</th>
                <th style={{ textAlign: 'center' }}>Kritikal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data yang ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.nama_sarana}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.alamat_sarana}</td>
                    <td>{formatDate(item.tanggal_pemeriksaan)}</td>
                    <td>{formatDate(item.tanggal_terima)}</td>
                    <td>{formatDate(item.tanggal_surat_tl)}</td>
                    <td>{formatDate(item.tanggal_capa)}</td>
                    
                    {/* Temuan */}
                    <td style={{ textAlign: 'center' }}>{item.temuan_minor || 0}</td>
                    <td style={{ textAlign: 'center' }}>{item.temuan_mayor || 0}</td>
                    <td style={{ textAlign: 'center' }}>{item.temuan_serius || 0}</td>
                    <td style={{ textAlign: 'center' }}>{item.temuan_kritikal || 0}</td>
                    
                    {/* Evaluasi CAPA */}
                    <td style={{ textAlign: 'center' }}>{item.evaluasi_minor || 0}</td>
                    <td style={{ textAlign: 'center' }}>{item.evaluasi_mayor || 0}</td>
                    <td style={{ textAlign: 'center' }}>{item.evaluasi_serius || 0}</td>
                    <td style={{ textAlign: 'center' }}>{item.evaluasi_kritikal || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
