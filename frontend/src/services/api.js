import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginPetugas: (data) => api.post('/auth/login-petugas', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
};

// Admin API calls (Petugas CRUD)
export const adminAPI = {
  getAllPetugas: () => api.get('/admin/petugas'),
  createPetugas: (data) => api.post('/admin/petugas', data),
  updatePetugas: (id, data) => api.put(`/admin/petugas/${id}`, data),
  deletePetugas: (id) => api.delete(`/admin/petugas/${id}`),
};

// Common API calls
export const commonAPI = {
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Petugas API calls
export const petugasAPI = {
  getPetugasByRole: (role) => api.get(`/petugas?role=${role}`),
};

// Sertifikasi API calls
export const sertifikasiAPI = {
  createPermohonan: (data) => api.post('/sertifikasi/permohonan', data),
  getMyPermohonan: () => api.get('/sertifikasi/permohonan/me'),
  getPermohonanByPetugas: () => api.get('/sertifikasi/permohonan/petugas'),
  getInformasiPetugas: () => api.get('/sertifikasi/informasi/petugas'),
  updateStatus: (id, status) => api.put(`/sertifikasi/permohonan/${id}/status`, { status }),
  createCapa: (data) => api.post('/sertifikasi/capa', data),
  getCapaByPermohonan: (permohonan_id) => api.get(`/sertifikasi/capa/${permohonan_id}`),
  updateCapa: (permohonan_id, data) => api.put(`/sertifikasi/capa/${permohonan_id}`, data),
};

// Inspeksi API calls
export const inspeksiAPI = {
  createPermohonan: (data) => api.post('/inspeksi/permohonan', data),
  getMyPermohonan: () => api.get('/inspeksi/permohonan/me'),
  getPermohonanByPetugas: () => api.get('/inspeksi/permohonan/petugas'),
  getInformasiPetugas: () => api.get('/inspeksi/informasi/petugas'),
  uploadTtd: (id, file_url) => api.put(`/inspeksi/permohonan/${id}/upload-ttd`, { file_url }),
  updateStatus: (id, status) => api.put(`/inspeksi/permohonan/${id}/status`, { status }),
  createCapa: (data) => api.post('/inspeksi/capa', data),
  getCapaByPermohonan: (permohonan_id) => api.get(`/inspeksi/capa/${permohonan_id}`),
  updateCapa: (permohonan_id, data) => api.put(`/inspeksi/capa/${permohonan_id}`, data),
  submitEvaluasiCapa: (permohonan_id, data) => api.put(`/inspeksi/permohonan/${permohonan_id}/submit-evaluasi`, data),
};

// Supervisor API calls
export const supervisorAPI = {
  getAllAntrean: () => api.get('/supervisor/antrean'),
  getSertifikasiSelesai: () => api.get('/supervisor/sertifikasi-selesai'),
  getInspeksiSelesai: () => api.get('/supervisor/inspeksi-selesai'),
  getInformasi: () => api.get('/supervisor/informasi'),
};

export default api;
