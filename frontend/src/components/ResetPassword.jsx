import { useState } from 'react';
import InputField from './InputField';
import PasswordStrength from './PasswordStrength';
import { validatePassword, validateConfirmPassword } from '../utils/validation';
import { authAPI } from '../services/api';
import { toast } from './Toast';

export default function ResetPassword({ token, onSuccess }) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
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
      await authAPI.resetPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setIsSuccess(true);
      toast.success('Password berhasil direset!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Token tidak valid atau sudah expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div>
        <div className="success-message">
          <div className="success-icon">🎉</div>
          <h3>Password Berhasil Direset!</h3>
          <p>Kamu sekarang bisa login dengan password baru.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-full"
          onClick={onSuccess}
          style={{ marginTop: '16px' }}
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="auth-form-header">
        <h2>Reset Password</h2>
        <p>Buat password baru untuk akun kamu.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div>
          <InputField
            id="reset-password"
            label="Password Baru"
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
          id="reset-confirm-password"
          label="Konfirmasi Password"
          type="password"
          icon="🔐"
          placeholder="Ulangi password baru"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <button
          type="submit"
          className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`}
          id="btn-reset-password"
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" />}
          <span className="btn-text">
            {isLoading ? 'Memproses...' : 'Reset Password'}
          </span>
        </button>
      </form>
    </div>
  );
}
