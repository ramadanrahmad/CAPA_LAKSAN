import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { inspeksiAPI, commonAPI } from '../services/api';
import { toast } from '../components/Toast';

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default function FormCapaPetugasInspeksi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = location.pathname.endsWith('/view');
  const isEditMode = location.pathname.endsWith('/edit-petugas');

  const [rows, setRows] = useState([]);
  const [permohonan, setPermohonan] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const userStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isPelakuUsaha = user?.role !== 'petugas' && user?.role !== 'admin' && user?.role !== 'supervisor';

  const showLockPetugas = isPelakuUsaha;
  const showLockPelaku = !isPelakuUsaha;

  useEffect(() => {
    if (isReadOnly || isEditMode) {
      fetchData();
    } else {
      // New Form
      setRows([
        { id: Date.now(), temuan: '', kriteria: 'Mayor', persyaratan: '', gap_analysis: '', dampak: '', tindakan_perbaikan: '', tindakan_pencegahan: '', waktu_penyelesaian: '', pic: '', bukti: '', status_capa: 'Open', hasil_evaluasi: '', file_surat: '', suratFiles: [] }
      ]);
    }
  }, [isReadOnly, isEditMode]);

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
            hasil_evaluasi: item.hasil_evaluasi || '',
            file_surat: item.file_surat || '',
            suratFiles: [],
            status_capa: item.status_capa || 'Open',
            original_status: item.status_capa || 'Open'
          }));
          setRows(formattedRows);
        }
        if (res.data.permohonan) {
          setPermohonan(res.data.permohonan);
        }
        if (res.data.history) {
          setHistoryData(res.data.history);
        }
      }
    } catch (error) {
      toast.error('Gagal mengambil data CAPA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), temuan: '', kriteria: 'Mayor', persyaratan: '', gap_analysis: '', dampak: '', tindakan_perbaikan: '', tindakan_pencegahan: '', waktu_penyelesaian: '', pic: '', bukti: '', status_capa: 'Open', hasil_evaluasi: '', file_surat: '', suratFiles: [] }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, idx) => idx !== index));
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
    const currentFiles = newRows[index].suratFiles || [];
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

    newRows[index].suratFiles = [...currentFiles, ...fileArray];
    setRows(newRows);
  };

  const removeIndividualFile = (rowIndex, fileIndex) => {
    const newRows = [...rows];
    newRows[rowIndex].suratFiles = newRows[rowIndex].suratFiles.filter((_, idx) => idx !== fileIndex);
    setRows(newRows);
  };

  const removeFile = (index) => {
    const newRows = [...rows];
    newRows[index].suratFiles = [];
    newRows[index].file_surat = '';
    setRows(newRows);
  };

  const handleSaveDraft = async () => {
    // Validation
    if (isEditMode) {
      const isInvalidEval = rows.some(row => !row.hasil_evaluasi.trim());
      const isInvalidStatus = rows.some(row => row.status_capa === 'Menunggu Evaluasi');
      
      if (isInvalidEval || isInvalidStatus) {
        toast.error('Mohon lengkapi semua kolom Hasil Evaluasi dan Status sebelum menyimpan draf.');
        return;
      }
    } else {
      const isInvalid = rows.some(row => !row.temuan.trim() || !row.persyaratan.trim());
      if (isInvalid) {
        toast.error('Mohon lengkapi semua kolom Temuan dan Persyaratan.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        temuanList: rows,
        targetStatus: isEditMode ? 'Upload File' : 'Menunggu Evaluasi'
      };

      let res;
      if (isEditMode) {
        res = await inspeksiAPI.updateCapa(id, payload);
      } else {
        payload.permohonan_id = id;
        res = await inspeksiAPI.createCapa(payload);
      }

      if (res.data.success) {
        toast.success(isEditMode ? 'Draf Evaluasi CAPA berhasil disimpan!' : 'Temuan CAPA berhasil dikirim!');
        
        if (isEditMode) {
          navigate(`/dashboard/inspeksi/capa/${id}/pdf`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
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
        EVALUASI PENINDAKAN PERBAIKAN DAN PENCEGAHAN / CORRECTIVE AND PREVENTIVE ACTION (TPP/CAPA) BALAI BESAR POM DI PALEMBANG
      </h2>

      <div style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>
        <h4 style={{ margin: '5px 0' }}>TPP/CAPA (ID Sarana: BPOMINS{id})</h4>
        {permohonan && (
          <>
            <p style={{ margin: '5px 0' }}><strong>Nama Sarana :</strong> {permohonan.nama_sarana}</p>
            <p style={{ margin: '5px 0' }}><strong>Alamat :</strong> {permohonan.alamat_sarana}</p>
          </>
        )}
      </div>

      {/* History Tables */}
      {Object.keys(historyData).map(tahap => (
        <div key={`history-tahap-${tahap}`} style={{ marginBottom: '30px', background: 'var(--dash-glass-bg)', borderRadius: '12px', padding: '20px', border: '1px solid var(--dash-glass-border)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--text-primary)' }}>Evaluasi CAPA {tahap}</h3>
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
                  <th style={{ width: '150px' }}>Bukti Perbaikan</th>
                  <th style={{ width: '250px' }}>Evaluasi</th>
                  <th style={{ width: '150px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyData[tahap].map((row, rowIndex) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{rowIndex + 1}</td>
                    <td><div style={{ whiteSpace: 'pre-wrap' }}>{row.temuan}</div></td>
                    <td>{row.kriteria}</td>
                    <td><div style={{ whiteSpace: 'pre-wrap' }}>{row.persyaratan}</div></td>
                    <td><div style={{ whiteSpace: 'pre-wrap' }}>{row.gap_analysis}</div></td>
                    <td><div style={{ whiteSpace: 'pre-wrap' }}>{row.dampak}</div></td>
                    <td><div style={{ whiteSpace: 'pre-wrap' }}>{row.tindakan_perbaikan}</div></td>
                    <td><div style={{ whiteSpace: 'pre-wrap' }}>{row.tindakan_pencegahan}</div></td>
                    <td>{row.waktu_penyelesaian}</td>
                    <td>{row.pic}</td>
                    <td>{row.bukti ? <a href={row.bukti} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Lihat Bukti</a> : '-'}</td>
                    <td><div style={{ whiteSpace: 'pre-wrap' }}>{row.hasil_evaluasi || '-'}</div></td>
                    <td>
                      <span className={`status-badge ${row.status_capa === 'Closed' ? 'badge-teal' : 'badge-red'}`}>
                        {row.status_capa || 'Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div style={{ background: 'var(--dash-glass-bg)', borderRadius: '12px', padding: '20px', border: '1px solid var(--dash-glass-border)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--text-primary)' }}>
          Evaluasi CAPA {permohonan?.tahap || 1} {Object.keys(historyData).length > 0 ? '(Saat Ini)' : ''}
        </h3>
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
                <th style={{ width: '150px' }}>Bukti Perbaikan</th>
                <th style={{ width: '250px' }}>Evaluasi</th>
                <th style={{ width: '150px' }}>Status</th>
                {!isReadOnly && !isEditMode && <th style={{ width: '80px' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                // Jika isReadOnly, disabled semua. Jika EditMode, Petugas hanya bisa edit Status dan Hasil Evaluasi (jika belum closed)
                const isClosedAndSaved = row.original_status === 'Closed';
                const disableInitialFields = isReadOnly || isEditMode;
                const disableEvaluasiFields = isReadOnly || (isEditMode && isClosedAndSaved);
                
                const isDraft = permohonan?.status === 'Perlu Evaluasi';
                const maskForPelaku = isPelakuUsaha && isDraft && row.status_capa !== 'Closed';
                const displayEvaluasi = maskForPelaku ? 'Menunggu Evaluasi Petugas...' : row.hasil_evaluasi;
                const displayStatus = maskForPelaku ? 'Menunggu Evaluasi' : row.status_capa;
                const isClosed = displayStatus === 'Closed';

                return (
                  <tr key={row.id} style={{
                    background: isClosed ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    opacity: isClosed ? 0.85 : 1,
                    transition: 'all 0.3s ease'
                  }}>
                    <td style={{ textAlign: 'center', verticalAlign: 'top', borderLeft: isClosed ? '4px solid #10b981' : '4px solid transparent' }}>{rowIndex + 1}</td>

                    <td style={{ position: 'relative' }}>
                      {showLockPetugas && <LockIcon />}
                      <textarea
                        className="glass-input"
                        placeholder="Isi temuan..."
                        value={row.temuan}
                        onChange={(e) => handleChange(rowIndex, 'temuan', e.target.value)}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled={disableInitialFields}
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      {showLockPetugas && <LockIcon />}
                      <select
                        className="glass-input select-input"
                        value={row.kriteria}
                        onChange={(e) => handleChange(rowIndex, 'kriteria', e.target.value)}
                        style={{ minWidth: '100px', width: '100%' }}
                        disabled={disableInitialFields}
                      >
                        <option value="Mayor">Mayor</option>
                        <option value="Minor">Minor</option>
                        <option value="Serius">Serius</option>
                        <option value="Kritikal">Kritikal</option>
                      </select>
                    </td>
                    <td style={{ position: 'relative' }}>
                      {showLockPetugas && <LockIcon />}
                      <textarea
                        className="glass-input"
                        placeholder="Isi persyaratan..."
                        value={row.persyaratan}
                        onChange={(e) => handleChange(rowIndex, 'persyaratan', e.target.value)}
                        onInput={autoResize}
                        style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                        disabled={disableInitialFields}
                      />
                    </td>

                    {/* Kolom Pelaku Usaha */}
                    {(!isEditMode && !isReadOnly) ? (
                      <td colSpan="7" style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'center', verticalAlign: 'middle', color: 'var(--text-muted)' }}>
                        <em style={{ fontSize: '0.9rem' }}>Diisi oleh Pelaku Usaha</em>
                      </td>
                    ) : (
                      <>
                        <td style={{ background: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                          {showLockPelaku && <LockIcon />}
                          <textarea className="glass-input" value={row.gap_analysis} style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }} disabled />
                        </td>
                        <td style={{ background: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                          {showLockPelaku && <LockIcon />}
                          <textarea className="glass-input" value={row.dampak} style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }} disabled />
                        </td>
                        <td style={{ background: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                          {showLockPelaku && <LockIcon />}
                          <textarea className="glass-input" value={row.tindakan_perbaikan} style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }} disabled />
                        </td>
                        <td style={{ background: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                          {showLockPelaku && <LockIcon />}
                          <textarea className="glass-input" value={row.tindakan_pencegahan} style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }} disabled />
                        </td>
                        <td style={{ background: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                          {showLockPelaku && <LockIcon />}
                          <input type="date" className="glass-input" value={row.waktu_penyelesaian} style={{ width: '100%' }} disabled />
                        </td>
                        <td style={{ background: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                          {showLockPelaku && <LockIcon />}
                          <textarea className="glass-input" value={row.pic} style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }} disabled />
                        </td>
                        <td style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'center', position: 'relative' }}>
                          {showLockPelaku && <LockIcon />}
                          {row.bukti ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {row.bukti.split(',').map((url, idx) => (
                                <a key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline', fontSize: '0.9rem', wordBreak: 'break-all', display: 'block', marginBottom: '4px' }}>Lihat File {idx + 1}</a>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                      </>
                    )}

                    {/* Evaluasi, Status & Surat */}
                    {(!isEditMode && !isReadOnly) ? (
                      <td colSpan="3" style={{ background: 'rgba(0,0,0,0.02)' }}></td>
                    ) : (
                      <>
                        <td style={{ position: 'relative' }}>
                          {showLockPetugas && <LockIcon />}
                          <textarea
                            className="glass-input"
                            placeholder="Isi evaluasi..."
                            value={displayEvaluasi}
                            onChange={(e) => handleChange(rowIndex, 'hasil_evaluasi', e.target.value)}
                            onInput={autoResize}
                            style={{ minHeight: '80px', width: '100%', overflow: 'hidden' }}
                            disabled={disableEvaluasiFields}
                          />
                        </td>
                        <td style={{ position: 'relative' }}>
                          {showLockPetugas && <LockIcon />}
                          <select
                            className="glass-input select-input"
                            value={displayStatus}
                            onChange={(e) => handleChange(rowIndex, 'status_capa', e.target.value)}
                            style={{ width: '100%', padding: '12px 4px', fontWeight: 'bold', color: displayStatus === 'Closed' ? '#10b981' : (displayStatus === 'Menunggu Evaluasi' ? '#f59e0b' : '#ef4444') }}
                            disabled={disableEvaluasiFields}
                          >
                            <option value="Menunggu Evaluasi" disabled hidden>{isPelakuUsaha ? 'Menunggu' : 'Pilih Status'}</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                      </>
                    )}

                    {!isReadOnly && !isEditMode && (
                      <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                        {rows.length > 1 && (
                          <button
                            onClick={() => handleRemoveRow(rowIndex)}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            X
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          {isReadOnly || isEditMode ? (
            <div />
          ) : (
            <button
              onClick={handleAddRow}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Tambah Temuan
            </button>
          )}

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => navigate(isPelakuUsaha ? '/dashboard/permohonan' : '/dashboard')}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--text-muted)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Kembali
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {isSubmitting ? 'Memproses...' : (isEditMode ? 'Simpan Draf Evaluasi' : 'Kirim Temuan')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
