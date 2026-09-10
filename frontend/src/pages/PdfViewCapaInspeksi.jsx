import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { inspeksiAPI } from '../services/api';

export default function PdfViewCapaInspeksi() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [permohonan, setPermohonan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasDownloaded = useRef(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!isLoading && rows.length > 0) {
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true' && !hasDownloaded.current) {
        hasDownloaded.current = true;
        // Wait a bit for images/fonts to render
        setTimeout(() => {
          handlePrint();
        }, 1000);
      }
    }
  }, [isLoading, rows, location]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch CAPA
      const resCapa = await inspeksiAPI.getCapaByPermohonan(id);
      if (resCapa.data.success) {
        if (resCapa.data.data) {
          setRows(resCapa.data.data);
        }
        if (resCapa.data.permohonan) {
          setPermohonan(resCapa.data.permohonan);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('capa-document');
    const opt = {
      margin: 10,
      filename: `BPOMINS${id}_CAPA.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    // Impor secara dinamis untuk menghindari SSR issues
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default().set(opt).from(element).save();
    });
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat Dokumen...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>

      <style>
        {`
          .print-table th, .print-table td {
            border: 1px solid #000 !important;
            color: #000 !important;
          }
        `}
      </style>

      {/* Action bar */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button 
          onClick={handlePrint}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
          Download
        </button>
      </div>

      {/* Document Content - Styled like a white paper */}
      <div id="capa-document" style={{
        width: '100%',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        color: '#000'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>
            EVALUASI PENINDAKAN PERBAIKAN DAN PENCEGAHAN / CORRECTIVE AND PREVENTIVE ACTION (TPP/CAPA) BALAI BESAR POM DI PALEMBANG
          </h2>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '5px 0' }}>TPP/CAPA (ID Sarana: BPOMINS{id})</h4>
          {permohonan && (
            <>
              <p style={{ margin: '5px 0' }}><strong>Nama Sarana :</strong> {permohonan.nama_sarana}</p>
              <p style={{ margin: '5px 0' }}><strong>Alamat :</strong> {permohonan.alamat_sarana}</p>
            </>
          )}
        </div>

        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', wordBreak: 'break-word' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ width: '3%', padding: '4px', border: '1px solid #000' }}>No</th>
              <th style={{ width: '11%', padding: '4px', border: '1px solid #000' }}>Temuan dan Observasi</th>
              <th style={{ width: '5%', padding: '4px', border: '1px solid #000' }}>Kriteria</th>
              <th style={{ width: '11%', padding: '4px', border: '1px solid #000' }}>Persyaratan</th>
              <th style={{ width: '9%', padding: '4px', border: '1px solid #000' }}>GAP Analysis</th>
              <th style={{ width: '8%', padding: '4px', border: '1px solid #000' }}>Dampak</th>
              <th style={{ width: '9%', padding: '4px', border: '1px solid #000' }}>Tindakan Perbaikan</th>
              <th style={{ width: '9%', padding: '4px', border: '1px solid #000' }}>Tindakan Pencegahan</th>
              <th style={{ width: '7%', padding: '4px', border: '1px solid #000' }}>Waktu Penyelesaian</th>
              <th style={{ width: '6%', padding: '4px', border: '1px solid #000' }}>PIC</th>
              <th style={{ width: '6%', padding: '4px', border: '1px solid #000' }}>Bukti Perbaikan</th>
              <th style={{ width: '11%', padding: '4px', border: '1px solid #000' }}>Evaluasi</th>
              <th style={{ width: '5%', padding: '4px', border: '1px solid #000' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', verticalAlign: 'top' }}>
                  {rowIndex + 1}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.temuan}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{row.kriteria}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.persyaratan}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.gap_analysis || '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.dampak || '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.tindakan_perbaikan || '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.tindakan_pencegahan || '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{row.waktu_penyelesaian ? row.waktu_penyelesaian.split('T')[0] : '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.pic || '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {row.bukti ? `Terlampir (${row.bukti.split(',').length} File)` : '-'}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.hasil_evaluasi || '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{row.status_capa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
