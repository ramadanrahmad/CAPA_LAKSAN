import { useState } from 'react';
import InputField from './InputField';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validation';
import { toast } from './Toast';

export default function LoginForm({ onSwitchToSignUp, onForgotPassword }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error on type
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    if (!formData.password) newErrors.password = 'Password wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password, rememberMe);
      toast.success('Selamat datang kembali!', 'Login Berhasil');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      toast.error(message);

      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-content-inner">
      <div className="auth-form-header">
        <h2>Selamat Datang</h2>
        <p>Masuk ke akun kamu untuk melanjutkan</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <InputField
          id="login-email"
          label="Email"
          type="email"
          icon="✉️"
          placeholder="nama@email.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <InputField
          id="login-password"
          label="Password"
          type="password"
          icon="🔒"
          placeholder="Masukkan password"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="form-footer">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remember-me" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">Ingat saya</label>
          </div>
          <button
            type="button"
            className="btn-link"
            onClick={onForgotPassword}
          >
            Lupa password?
          </button>
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`}
          id="btn-login"
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" />}
          <span className="btn-text">{isLoading ? 'Memproses...' : 'Masuk'}</span>
        </button>
      </form>

      <div className="form-switch">
        Belum punya akun?
        <button type="button" onClick={onSwitchToSignUp}>
          Daftar sekarang
        </button>
      </div>
    </div>
  );
}
