/**
 * Form validation utilities
 */

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email wajib diisi';
  if (!regex.test(email)) return 'Format email tidak valid';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password wajib diisi';
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (!/[a-z]/.test(password)) return 'Password harus mengandung huruf kecil';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung huruf besar';
  if (!/\d/.test(password)) return 'Password harus mengandung angka';
  return '';
};

export const validateName = (name) => {
  if (!name) return 'Nama wajib diisi';
  if (name.length < 2) return 'Nama minimal 2 karakter';
  if (name.length > 100) return 'Nama maksimal 100 karakter';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Konfirmasi password wajib diisi';
  if (password !== confirmPassword) return 'Password tidak cocok';
  return '';
};

/**
 * Calculate password strength
 * Returns: { score: 0-4, label: string, level: string }
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', level: '' };

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const levels = {
    0: { label: '', level: '' },
    1: { label: 'Lemah', level: 'weak' },
    2: { label: 'Cukup', level: 'medium' },
    3: { label: 'Kuat', level: 'strong' },
    4: { label: 'Sangat Kuat', level: 'very-strong' },
  };

  return { score, ...levels[score] };
};
