/**
 * Simple API Service for Flask Backend
 * 
 * HOW TO USE:
 * 1. Set VITE_API_URL in your .env file (or it defaults to http://localhost:5000)
 * 2. Import and call: import api from '@/services/api'
 * 3. Call endpoints: const users = await api.get('/api/users')
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Simple fetch wrapper with error handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Required for session cookies from Flask
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Simple API methods
const api = {
  // GET request
  get: <T>(endpoint: string) => request<T>(endpoint),

  // POST request with JSON body
  post: <T>(endpoint: string, data?: object) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // PUT request with JSON body
  put: <T>(endpoint: string, data?: object) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // DELETE request
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  // POST with FormData (for file uploads)
  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    }),
};

export default api;

/**
 * USAGE EXAMPLES:
 * 
 * // Login
 * await api.post('/login', { email, password });
 * 
 * // Get current user
 * const user = await api.get('/api/me');
 * 
 * // Get all users
 * const users = await api.get('/api/users');
 * 
 * // Create session
 * await api.post('/api/sessions', { name: 'Meeting', date: '2024-01-15' });
 * 
 * // Mark attendance
 * await api.post('/api/attendance', { session_id: 1, user_id: 2, status: 'present' });
 * 
 * // Upload profile picture
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * await api.upload('/api/profile/picture', formData);
 * 
 * // Delete session
 * await api.delete('/api/sessions/1');
 */
