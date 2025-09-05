import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Request interceptor to log outgoing requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to log incoming responses
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    // Also set the token in cookies for backend compatibility
    document.cookie = `token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    try { localStorage.setItem('attendly_token', token); } catch {}
  } else {
    delete api.defaults.headers.common.Authorization;
    // Remove the token cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    try { localStorage.removeItem('attendly_token'); } catch {}
  }
}

// initialize from storage on load
try {
  const existing = localStorage.getItem('attendly_token');
  if (existing) setAuthToken(existing);
} catch {}

export default api;


