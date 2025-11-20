import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const formsApi = {
  getAll: (params?: { status?: string; folderId?: string }) =>
    api.get('/forms', { params }),
  getById: (id: string) => api.get(`/forms/${id}`),
  getByUrl: (shareableUrl: string) => api.get(`/forms/public/${shareableUrl}`),
  create: (data: any) => api.post('/forms', data),
  update: (id: string, data: any) => api.patch(`/forms/${id}`, data),
  delete: (id: string) => api.delete(`/forms/${id}`),
  duplicate: (id: string) => api.post(`/forms/${id}/duplicate`),
  getQRCode: (id: string) => api.get(`/forms/${id}/qrcode`),
};

export const questionsApi = {
  getByForm: (formId: string) => api.get(`/questions/form/${formId}`),
  create: (formId: string, data: any) => api.post(`/questions/form/${formId}`, data),
  update: (id: string, data: any) => api.patch(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
  reorder: (formId: string, questionIds: string[]) =>
    api.patch(`/questions/form/${formId}/reorder`, { questionIds }),
  duplicate: (id: string) => api.post(`/questions/${id}/duplicate`),
};

export const responsesApi = {
  submit: (data: any) => api.post('/responses/submit', data),
  getByForm: (formId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/responses/form/${formId}`, { params }),
  getById: (id: string) => api.get(`/responses/${id}`),
  delete: (id: string) => api.delete(`/responses/${id}`),
};

export const analyticsApi = {
  getFormAnalytics: (formId: string) => api.get(`/analytics/form/${formId}`),
  exportCSV: (formId: string) =>
    api.get(`/analytics/form/${formId}/export/csv`, { responseType: 'blob' }),
  exportJSON: (formId: string) =>
    api.get(`/analytics/form/${formId}/export/json`, { responseType: 'blob' }),
};

export const templatesApi = {
  getAll: (params?: { category?: string; publicOnly?: boolean }) =>
    api.get('/templates', { params }),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
};

export default api;

