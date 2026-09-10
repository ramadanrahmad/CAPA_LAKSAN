import { useState, useEffect } from 'react';
import { supervisorAPI } from '../services/api';
import { toast } from '../components/Toast';

export default function InformasiSupervisor() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('Semua');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await supervisorAPI.getInformasi();
      if (res.data.success) {
        // Sort descending by created_at
        const sortedData = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setData(sortedData);
        setFilteredData(sortedData);
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

    if (filterType !== 'Semua') {
      result = result.filter(item => item.type === filterType.toLowerCase());
    }

    if (startDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.tanggal_surat_tl || item.tanggal_pemeriksaan || item.created_at);
        return itemDate >= new Date(startDate);
      });
    }

    if (endDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.tanggal_surat_tl || item.tanggal_pemeriksaan || item.created_at);
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return itemDate <= end;
      });
    }

    setFilteredData(result);
  }, [searchTerm, filterType, startDate, endDate, data]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="sertifikasi-page">
      <div className="permohonan-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Informasi Rekapitulasi Sarana</h2>
      </div>

      {/* Filter Section */}
      <div className="filter-section" style={{ 
        display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap',
        background: 'var(--card-bg)', padding: '20px', borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
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
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Layanan</label>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ 
              width: '150px', padding: '10px 15px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="Semua">Semua</option>
            <option value="Sertifikasi">Sertifikasi</option>
            <option value="Inspeksi">Inspeksi</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mulai Dari</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ 
              width: '150px', padding: '10px 15px', borderRadius: '8px',
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
              width: '150px', padding: '10px 15px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="bpom-table" style={{ whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle', width: '50px' }}>NO</th>
                <th rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>Layanan</th>
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
                  <td colSpan="15" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="15" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data informasi.</td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: item.type === 'sertifikasi' ? '#38bdf8' : '#8b5cf6', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.type.toUpperCase()}</span>
                    </td>
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
