import axios from 'axios';

// Point at the backend. Override with VITE_API_URL when it isn't on localhost.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Intercept requests and add the Authorization header if a token exists
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// A dead/expired token should log you out instead of leaving the UI in a
// half-signed-in state where every request quietly 401s.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthAttempt && getToken()) {
      clearToken();
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

/**
 * Turn any axios failure into a string that is safe to render.
 *
 * FastAPI returns `detail` as a string for HTTPException but as an array of
 * objects for 422 validation errors - rendering that array directly crashes
 * React with "Objects are not valid as a React child".
 */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  // No response at all means the request never reached the API.
  if (!error.response) {
    return `Cannot reach the server at ${API_BASE_URL}. Make sure the backend is running.`;
  }

  const detail = error.response.data?.detail;

  if (typeof detail === 'string' && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : null;
        const msg = item?.msg || 'Invalid value';
        return field && field !== 'body' ? `${field}: ${msg}` : msg;
      })
      .filter(Boolean);
    if (messages.length) return messages.join(' · ');
  }

  if (typeof error.response.data === 'string' && error.response.data.trim()) {
    return error.response.data;
  }

  return fallback;
}

export default api;
