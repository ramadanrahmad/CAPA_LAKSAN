import { useState } from 'react';
import InputField from './InputField';
import { useAuth } from '../hooks/useAuth';
import { toast } from './Toast';

export default function LoginPetugasForm({ onForgotPassword }) {
  const { loginPetugas } = useAuth();
  const [formData, setFormData] = useState({ nip: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nip) newErrors.nip = 'NIP wajib diisi';
    if (!formData.password) newErrors.password = 'Password wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await loginPetugas(formData.nip, formData.password, rememberMe);
      toast.success('Selamat datang, Petugas!', 'Login Berhasil');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-content-inner">
      <div className="auth-form-header">
        <h2>Login Petugas</h2>
        <p>Masuk menggunakan NIP dan Password</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <InputField
          id="login-nip"
          label="NIP"
          type="text"
          icon="🆔"
          placeholder="Masukkan NIP"
          value={formData.nip}
          onChange={handleChange('nip')}
          error={errors.nip}
        />

        <InputField
          id="login-petugas-password"
          label="Password"
          type="password"
          icon="🔒"
          placeholder="Masukkan password"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
        />

        <div className="form-footer">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remember-me-petugas" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me-petugas">Ingat saya</label>
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
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" />}
          <span className="btn-text">{isLoading ? 'Memproses...' : 'Masuk'}</span>
        </button>
      </form>
    </div>
  );
}
