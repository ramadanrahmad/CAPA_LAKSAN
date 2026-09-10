import { useState } from 'react';
import InputField from './InputField';
import PasswordStrength from './PasswordStrength';
import { useAuth } from '../hooks/useAuth';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from '../utils/validation';
import { toast } from './Toast';

export default function SignUpForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      toast.success('Akun berhasil dibuat! Silakan login.', 'Registrasi Berhasil');
      onSwitchToLogin();
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
        <h2>Buat Akun Baru</h2>
        <p>Daftar untuk mulai menggunakan layanan kami</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <InputField
          id="signup-name"
          label="Nama Lengkap"
          type="text"
          icon="👤"
          placeholder="Masukkan nama lengkap"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          autoComplete="name"
        />

        <InputField
          id="signup-email"
          label="Email"
          type="email"
          icon="✉️"
          placeholder="nama@email.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <InputField
            id="signup-password"
            label="Password"
            type="password"
            icon="🔒"
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordStrength password={formData.password} />
        </div>

        <InputField
          id="signup-confirm-password"
          label="Konfirmasi Password"
          type="password"
          icon="🔐"
          placeholder="Ulangi password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />



        <button
          type="submit"
          className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`}
          id="btn-signup"
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" />}
          <span className="btn-text">
            {isLoading ? 'Memproses...' : 'Daftar'}
          </span>
        </button>
      </form>

      <div className="form-switch">
        Sudah punya akun?
        <button type="button" onClick={onSwitchToLogin}>
          Masuk
        </button>
      </div>
    </div>
  );
}
