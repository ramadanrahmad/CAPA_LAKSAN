import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inspeksiAPI, commonAPI } from '../services/api';
import { toast } from '../components/Toast';

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default function FormCapaPelakuUsahaInspeksi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [permohonan, setPermohonan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-resize textareas when rows change (e.g., initial load)
  useEffect(() => {
    if (rows.length > 0) {
      setTimeout(() => {
        document.querySelectorAll('textarea').forEach(el => {
          el.style.height = '80px';
          el.style.height = el.scrollHeight + 'px';
        });
      }, 100);
    }
  }, [rows]);

  const autoResize = (e) => {
    e.target.style.height = '80px';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await inspeksiAPI.getCapaByPermohonan(id);
      if (res.data.success) {
        if (res.data.data.length > 0) {
          const formattedRows = res.data.data.map(item => ({
            ...item,
            waktu_penyelesaian: item.waktu_penyelesaian ? item.waktu_penyelesaian.split('T')[0] : '',
            gap_analysis: item.gap_analysis || '',
            dampak: item.dampak || '',
            tindakan_perbaikan: item.tindakan_perbaikan || '',
            tindakan_pencegahan: item.tindakan_pencegahan || '',
            pic: item.pic || '',
            bukti: item.bukti || '',
            buktiFiles: [], // Array of files
            hasil_evaluasi: item.hasil_evaluasi || '',
            status_capa: item.status_capa || 'Open'
          }));
          setRows(formattedRows);
        }
        if (res.data.permohonan) {
          setPermohonan(res.data.permohonan);
        }
      }
    } catch (error) {
      toast.error('Gagal mengambil data CAPA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleFileChange = (index, files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    
    const newRows = [...rows];
    const currentFiles = newRows[index].buktiFiles || [];
    const totalFiles = currentFiles.length + fileArray.length;

    if (totalFiles > 5) {
      toast.error('Maksimal 5 file yang dapat diunggah sekaligus!');
      return;
    }

    const isOversized = fileArray.some(f => f.size > 10 * 1024 * 1024);
    if (isOversized) {
      toast.error('Setiap file maksimal berukuran 10MB');
      return;
    }

    newRows[index].buktiFiles = [...currentFiles, ...fileArray];
    setRows(newRows);
  };

  const removeIndividualFile = (rowIndex, fileIndex) => {
    const newRows = [...rows];
    newRows[rowIndex].buktiFiles = newRows[rowIndex].buktiFiles.filter((_, idx) => idx !== fileIndex);
    setRows(newRows);
  };

  const removeFile = (index) => {
    const newRows = [...rows];
    newRows[index].buktiFiles = [];
    newRows[index].bukti = ''; // clear any existing URL if they want to remove it
    setRows(newRows);
  };

  const handleSubmit = async () => {
    // Validasi input: hanya untuk baris yang statusnya Open
    const isInvalid = rows.some(row => 
      row.status_capa === 'Open' && (
        !row.gap_analysis.trim() || 
        !row.dampak.trim() || 
        !row.tindakan_perbaikan.trim() || 
        !row.tindakan_pencegahan.trim() ||
        !row.waktu_penyelesaian || 
        !row.pic.trim() ||
        (!row.bukti && (!row.buktiFiles || row.buktiFiles.length === 0))
      )
    );

    if (isInvalid) {
      toast.error('Mohon lengkapi semua kolom pada baris yang berstatus Open termasuk Bukti Perbaikan.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload pending files first
      const updatedRows = [...rows];
      for (let i = 0; i < updatedRows.length; i++) {
        if (updatedRows[i].buktiFiles && updatedRows[i].buktiFiles.length > 0) {
          const formData = new FormData();
          updatedRows[i].buktiFiles.forEach(file => {
            formData.append('files', file);
          });
          
          try {
            const res = await commonAPI.uploadFile(formData);
            if (res.data.success) {
              const envUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '';
              const backendUrl = '';
              
              let urlString = '';
              if (res.data.fileUrls) {
                urlString = res.data.fileUrls.map(url => backendUrl + url).join(', ');
              }

              // Append to existing if any
              if (updatedRows[i].bukti) {
                updatedRows[i].bukti += ', ' + urlString;
              } else {
                updatedRows[i].bukti = urlString;
              }
              // Clear pending files
              updatedRows[i].buktiFiles = [];
            }
          } catch (uploadErr) {
            console.error('Upload file error:', uploadErr);
            toast.error('Gagal mengunggah file. Coba lagi.');
            setIsSubmitting(false);
            return;
          }
        }
      }

      const payload = {
        temuanList: updatedRows,
        targetStatus: 'Perlu Evaluasi' // Kembali ke petugas untuk dievaluasi
      };

      const res = await inspeksiAPI.updateCapa(id, payload);

      if (res.data.success) {
        toast.success('Jawaban CAPA berhasil dikirim!');
        navigate('/dashboard/permohonan');
      }
    } catch (error) {
      console.error('Submit CAPA Pelaku Usaha error:', error);
      toast.error('Terjadi kesalahan saat menyimpan formulir CAPA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>Memuat data CAPA...</div>;
  }

  return (
    <div className="capa-container" style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '10px' }}>
        EVALUASI TINDAK LANJUT PENINDAKAN PERBAIKAN DAN PENCEGAHAN / CORRECTIVE AND PREVENTIVE ACTION (TPP/CAPA) BALAI BESAR POM DI PALEMBANG
      </h2>

      <div style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>
        <h4 style={{ margin: '5px 0' }}>TPP/CAPA (ID Sarana: BPOMINS{id})</h4>
        {permohonan && (
          <>
            <p style={{ margin: '5px 0' }}><strong>Nama Sarana :</strong> {permohonan.nama_sarana}</p>
            <p style={{ margin: '5px 0' }}><strong>Alamat :</strong> {permohonan.alamat_sarana}</p>
            {permohonan.file_evaluasi && (
              <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px' }}>
                <p style={{ margin: '0' }}>
                  <strong>Surat Evaluasi CAPA:</strong>{' '}
                  <a href={permohonan.file_evaluasi} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 'bold' }}>Download Dokumen</a>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ background: 'var(--dash-glass-bg)', borderRadius: '12px', padding: '20px', border: '1px solid var(--dash-glass-border)' }}>
        <div className="table-responsive">
          <table className="bpom-table" style={{ width: '100%', minWidth: '1800px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th style={{ width: '250px' }}>Temuan dan Observasi</th>
                <th style={{ width: '180px' }}>Kriteria</th>
                <th style={{ width: '250px' }}>Persyaratan</th>
                <th style={{ width: '200px' }}>GAP Analysis</th>
                <th style={{ width: '200px' }}>Dampak</th>
                <th style={{ width: '200px' }}>Tindakan Perbaikan</th>
                <th style={{ width: '200px' }}>Tindakan Pencegahan</th>
                <th style={{ width: '130px' }}>Waktu Penyelesaian</th>
                <th style={{ width: '150px' }}>PIC</th>
                <th style={{ width: '200px' }}>Bukti Perbaikan</th>
                <th style={{ width: '250px' }}>Evaluasi</th>
                <th style={{ width: '140px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                // Pelaku Usaha mengedit bagiannya sendiri JIKA status masih Open
                const isClosed = row.status_capa === 'Closed';
                const isEditable = !isClosed;
                const isDraft = permohonan?.status === 'Perlu Evaluasi';
                const maskForPelaku = isDraft && row.status_capa !== 'Closed';
                const displayEvaluasi = maskForPelaku ? 'Menunggu Evaluasi Petugas...' : row.hasil_evaluasi;
                const displayStatus = maskForPelaku ? 'Menunggu' : row.status_capa;

                return (
                  <tr key={row.id} style={{
                    background: isClosed ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    opacity: isClosed ? 0.85 : 1,
                    transition: 'all 0.3s ease'
                  }}>
                    <td style={{ textAlign: 'center', verticalAlign: 'top', borderLeft: isClosed ? '4px solid #10b981' : '4px solid transparent' }}>{rowIndex + 1}</td>

                    {/* Kolom Petugas (Read Only) */}
                    <td style={{ position: 'relative' }}>
                      <LockIcon />
                      <textarea
                        className="glass-input"
                        value={row.temuan}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      <LockIcon />
                      <input
                        type="text"
                        className="glass-input"
                        value={row.kriteria}
                        style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }}
                        disabled
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      <LockIcon />
                      <textarea
                        className="glass-input"
                        value={row.persyaratan}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled
                      />
                    </td>

                    {/* Kolom Pelaku Usaha (Editable if Open) */}
                    <td style={{ position: 'relative' }}>
                      {!isEditable && <LockIcon />}
                      <textarea
                        className="glass-input"
                        placeholder="Isi GAP Analysis..."
                        value={row.gap_analysis}
                        onChange={(e) => handleChange(rowIndex, 'gap_analysis', e.target.value)}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled={!isEditable}
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      {!isEditable && <LockIcon />}
                      <textarea
                        className="glass-input"
                        placeholder="Isi Dampak..."
                        value={row.dampak}
                        onChange={(e) => handleChange(rowIndex, 'dampak', e.target.value)}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled={!isEditable}
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      {!isEditable && <LockIcon />}
                      <textarea
                        className="glass-input"
                        placeholder="Isi Tindakan Perbaikan..."
                        value={row.tindakan_perbaikan}
                        onChange={(e) => handleChange(rowIndex, 'tindakan_perbaikan', e.target.value)}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled={!isEditable}
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      {!isEditable && <LockIcon />}
                      <textarea
                        className="glass-input"
                        placeholder="Isi Tindakan Pencegahan..."
                        value={row.tindakan_pencegahan}
                        onChange={(e) => handleChange(rowIndex, 'tindakan_pencegahan', e.target.value)}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled={!isEditable}
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      {!isEditable && <LockIcon />}
                      <input
                        type="date"
                        className="glass-input"
                        value={row.waktu_penyelesaian}
                        onChange={(e) => handleChange(rowIndex, 'waktu_penyelesaian', e.target.value)}
                        style={{ width: '100%' }}
                        disabled={!isEditable}
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      {!isEditable && <LockIcon />}
                      <textarea
                        className="glass-input"
                        placeholder="Isi PIC..."
                        value={row.pic}
                        onChange={(e) => handleChange(rowIndex, 'pic', e.target.value)}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled={!isEditable}
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      {!isEditable && <LockIcon />}
                      {row.buktiFiles && row.buktiFiles.length > 0 && (
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                            <strong>File siap diunggah ({row.buktiFiles.length}/5):</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
                              {row.buktiFiles.map((f, idx) => {
                                const isImage = f.type.startsWith('image/');
                                const previewUrl = isImage ? URL.createObjectURL(f) : null;
                                return (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dash-glass-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--dash-glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                      {isImage && (
                                        <img src={previewUrl} alt="preview" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px' }} />
                                      )}
                                      <span 
                                        style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isImage ? '90px' : '120px', cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline' }} 
                                        title={`Lihat Preview: ${f.name}`}
                                        onClick={() => {
                                          const url = previewUrl || URL.createObjectURL(f);
                                          window.open(url, '_blank');
                                        }}
                                      >
                                        {f.name}
                                      </span>
                                    </div>
                                    <button onClick={() => removeIndividualFile(rowIndex, idx)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: '0 4px', lineHeight: '1' }} title="Hapus file ini">×</button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {row.bukti && (!row.buktiFiles || row.buktiFiles.length === 0) ? (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}><strong>File Tersimpan:</strong></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {row.bukti.split(',').map((url, idx) => (
                              <a key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline', fontSize: '0.9rem', wordBreak: 'break-all' }}>Dokumen {idx + 1}</a>
                            ))}
                          </div>
                          {isEditable && (
                            <button onClick={() => removeFile(rowIndex)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
                              Hapus Semua Dokumen & Ganti Baru
                            </button>
                          )}
                        </div>
                      ) : (!row.buktiFiles || row.buktiFiles.length < 5) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <input 
                            type="file" 
                            multiple
                            onChange={(e) => handleFileChange(rowIndex, e.target.files)}
                            style={{ width: '100%', fontSize: '0.75rem', padding: '4px', border: '1px dashed var(--text-muted)', borderRadius: '4px' }} 
                            disabled={!isEditable} 
                            accept=".jpg,.jpeg,.png,.pdf"
                          />
                          <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', lineHeight: '1.2' }}>Maks. 5 File (10MB/file)</small>
                        </div>
                      ) : null}
                    </td>

                    {/* Kolom Petugas (Read Only) */}
                    <td style={{ position: 'relative' }}>
                      <LockIcon />
                      <textarea
                        className="glass-input"
                        value={displayEvaluasi}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      <LockIcon />
                      <input
                        type="text"
                        className="glass-input"
                        value={displayStatus}
                        style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', color: displayStatus === 'Closed' ? '#10b981' : (displayStatus === 'Menunggu' || displayStatus === 'Menunggu Evaluasi' ? '#f59e0b' : '#ef4444') }}
                        disabled
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <div />

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => navigate('/dashboard/permohonan')}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--text-muted)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {isSubmitting ? 'Memproses dan Mengunggah...' : 'Kirim CAPA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
