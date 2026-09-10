import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { petugasAPI, sertifikasiAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/Toast';
import MultiSelectPetugas from '../components/MultiSelectPetugas';

export default function FormSertifikasi() {
  const navigate = useNavigate();
  const [petugasList, setPetugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const isVerified = user?.email_verified === 1 || user?.email_verified === true;

  // Form State
  const [formData, setFormData] = useState({
    nama_sarana: '',
    alamat_sarana: '',
    no_hp: '',
    email: '',
    penanggung_jawab_id: [],
    tanggal_pemeriksaan: '',
    tanggal_terima: '',
    kabupaten_kota: '',
    jenis_komoditi: '',
  });

  useEffect(() => {
    const fetchPetugas = async () => {
      try {
        const response = await petugasAPI.getPetugasByRole('sertifikasi');
        if (response.data.success) {
          setPetugasList(response.data.data);
        }
      } catch (error) {
        toast.error('Gagal mengambil data petugas sertifikasi.');
      } finally {
        setIsLoading(false);
      }
    };
    if (!isVerified) {
      toast.error('Silakan verifikasi email Anda terlebih dahulu.');
      navigate('/dashboard');
      return;
    }
    fetchPetugas();
  }, [isVerified, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi sederhana
    if (!formData.nama_sarana || formData.penanggung_jawab_id.length === 0 || !formData.jenis_komoditi || !formData.kabupaten_kota || !formData.alamat_sarana || !formData.email || !formData.no_hp) {
      toast.warning('Silakan lengkapi semua kolom yang wajib diisi.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const submitData = {
        ...formData,
        penanggung_jawab_id: formData.penanggung_jawab_id.join(',')
      };
      const response = await sertifikasiAPI.createPermohonan(submitData);
      if (response.data.success) {
        toast.success(response.data.message || 'Permohonan berhasil dikirim!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengirim permohonan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sertifikasi-page">
      <div className="sertifikasi-header">
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>CAPA Sertifikasi</h1>
      </div>

      <div className="sertifikasi-card">
        <h2 className="sertifikasi-card-title">Isi Data Sarana</h2>
        
        <form onSubmit={handleSubmit} className="sertifikasi-form">
          <div className="sertifikasi-grid">
            
            {/* Kolom Kiri */}
            <div className="form-column">
              <div className="input-group">
                <label>Nama Sarana</label>
                <input type="text" name="nama_sarana" value={formData.nama_sarana} onChange={handleChange} className="glass-input" required />
              </div>
              <div className="input-group">
                <label>Alamat Sarana</label>
                <input type="text" name="alamat_sarana" value={formData.alamat_sarana} onChange={handleChange} className="glass-input" required />
              </div>
              <div className="input-group">
                <label>No. Telpon/HP</label>
                <input type="tel" name="no_hp" value={formData.no_hp} onChange={handleChange} className="glass-input" required />
              </div>
              <div className="input-group">
                <label>E-mail Sarana</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="glass-input" required />
              </div>
            </div>

            {/* Kolom Tengah */}
            <div className="form-column">
              <div className="input-group">
                <label>Nama Petugas</label>
                <MultiSelectPetugas 
                  petugasList={petugasList}
                  selectedIds={formData.penanggung_jawab_id}
                  isLoading={isLoading}
                  onChange={(newIds) => setFormData({ ...formData, penanggung_jawab_id: newIds })}
                />
              </div>
              <div className="input-group">
                <label>Tanggal Pemeriksaan Oleh Petugas</label>
                <input type="date" name="tanggal_pemeriksaan" value={formData.tanggal_pemeriksaan} onChange={handleChange} className="glass-input" />
              </div>
              <div className="input-group">
                <label>Tanggal Terima Surat</label>
                <input type="date" name="tanggal_terima" value={formData.tanggal_terima} onChange={handleChange} className="glass-input" />
              </div>
              <div className="input-group">
                <label>Kabupaten/Kota</label>
                <input type="text" name="kabupaten_kota" value={formData.kabupaten_kota} onChange={handleChange} className="glass-input" required />
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="form-column column-right">
              <div className="input-group">
                <label>Jenis Komoditi</label>
                <select name="jenis_komoditi" value={formData.jenis_komoditi} onChange={handleChange} className="glass-input select-input" required>
                  <option value="">Pilih Jenis Komoditi</option>
                  <option value="Pangan">Pangan</option>
                  <option value="Kosmetik">Kosmetik</option>
                  <option value="Obat">Obat</option>
                  <option value="Obat Bahan Alam">Obat Bahan Alam</option>
                </select>
              </div>

              <div className="submit-container">
                <button type="submit" className="btn-submit-sertifikasi" disabled={isSubmitting}>
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </div>

          </div>
          
          <div className="form-footer-note">
            <p>*Sebelum mengirim data, pastikan seluruh informasi yang diinput sudah benar dan sesuai.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
