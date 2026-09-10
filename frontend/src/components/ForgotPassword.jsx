import { useState } from 'react';
import InputField from './InputField';
import { validateEmail } from '../utils/validation';
import { authAPI } from '../services/api';
import { toast } from './Toast';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setIsSent(true);
      toast.success('Cek inbox email kamu untuk link reset password.');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div>
        <div className="success-message">
          <div className="success-icon">📧</div>
          <h3>Email Terkirim!</h3>
          <p>
            Kami telah mengirim link reset password ke <strong>{email}</strong>.
            Silakan cek inbox atau folder spam kamu.
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button type="button" className="back-link" onClick={onBack}>
            ← Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="auth-form-header">
        <h2>Lupa Password?</h2>
        <p>Masukkan email kamu dan kami akan mengirim link untuk reset password.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <InputField
          id="forgot-email"
          label="Email"
          type="email"
          icon="✉️"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
          autoComplete="email"
        />

        <button
          type="submit"
          className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`}
          id="btn-forgot-password"
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" />}
          <span className="btn-text">
            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
          </span>
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <button type="button" className="back-link" onClick={onBack}>
          ← Kembali ke Login
        </button>
      </div>
    </div>
  );
}
