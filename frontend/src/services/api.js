import axios from 'axios';
const API_BASE_URL = 'form-nwm3d6q13-process-projects-5e9f056d.vercel.app/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Error setting up request
      return Promise.reject({
        success: false,
        message: error.message,
      });
    }
  }
);

// API functions
export const submitForm = async (formData) => {
  const response = await api.post('/form/submit', formData);
  return response.data;
};

export const getAllSubmissions = async () => {
  const response = await api.get('/form/submissions');
  return response.data;
};

export const downloadSubmission = async (id) => {
  const response = await api.get(`/form/download/${id}`, );
  return response.data;
};

export default api;
