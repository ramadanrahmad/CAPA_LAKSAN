import { useState, useRef, useEffect } from 'react';

export default function MultiSelectPetugas({ petugasList, selectedIds, onChange, isLoading }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (petugas) => {
    if (selectedIds.length >= 3) return; // Max 3
    if (selectedIds.includes(petugas.id)) return; // Already selected

    onChange([...selectedIds, petugas.id]);
    setSearch('');
    setIsOpen(false);
  };

  const handleRemove = (idToRemove) => {
    onChange(selectedIds.filter(id => id !== idToRemove));
  };

  const filteredPetugas = petugasList.filter(petugas =>
    petugas.nama.toLowerCase().includes(search.toLowerCase()) &&
    !selectedIds.includes(petugas.id)
  );

  return (
    <div className="multi-select-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>

      {/* Selected Chips Area */}
      <div
        className="glass-input"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          minHeight: '42px',
          alignItems: 'center',
          cursor: 'text'
        }}
        onClick={() => setIsOpen(true)}
      >
        {selectedIds.map(id => {
          const petugas = petugasList.find(p => p.id === id);
          if (!petugas) return null;
          return (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '4px 8px',
                borderRadius: '16px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)'
              }}
            >
              <span>{petugas.nama}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(id); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(239, 68, 68, 0.8)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
            </div>
          );
        })}

        {/* Input for searching */}
        {selectedIds.length < 3 && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedIds.length === 0 ? "Ketik nama petugas..." : ""}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              flex: 1,
              minWidth: '120px',
              fontSize: '0.9rem'
            }}
          />
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--dropdown-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--dash-glass-border)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 50
        }}>
          {isLoading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Memuat data...
            </div>
          ) : filteredPetugas.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {search ? 'Tidak ada petugas ditemukan.' : 'Semua petugas telah dipilih.'}
            </div>
          ) : (
            filteredPetugas.map(petugas => (
              <div
                key={petugas.id}
                onClick={() => handleSelect(petugas)}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.2s',
                  color: 'var(--text-primary)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {petugas.nama}
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        *Pilih minimal 1, maksimal 3 petugas.
      </div>
    </div>
  );
}
