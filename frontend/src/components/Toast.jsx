import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

let toastId = 0;
let addToastFn = null;

// Global toast functions
export const toast = {
  success: (message, title = 'Berhasil') =>
    addToastFn?.({ type: 'success', title, message }),
  error: (message, title = 'Error') =>
    addToastFn?.({ type: 'error', title, message }),
  warning: (message, title = 'Peringatan') =>
    addToastFn?.({ type: 'warning', title, message }),
  info: (message, title = 'Info') =>
    addToastFn?.({ type: 'info', title, message }),
};

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    ({ type, title, message }) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, type, title, message, exiting: false }]);

      // Auto dismiss after 5 seconds
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  return createPortal(
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}${t.exiting ? ' exiting' : ''}`}>
          <span className="toast-icon">{ICONS[t.type]}</span>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            <div className="toast-message">{t.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => removeToast(t.id)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
