// API Service for Flask Backend Integration
// Configure API_BASE_URL to point to your Flask server

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | null | Record<string, unknown>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const { body, ...restOptions } = options;
  
  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for session cookies from Flask
  };

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body as BodyInit;
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) => 
    request('/login', { method: 'POST', body: { email, password } }),
  
  logout: () => 
    request('/logout', { method: 'POST' }),
  
  getCurrentUser: () => 
    request('/api/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/api/change-password', { 
      method: 'POST', 
      body: { current_password: currentPassword, new_password: newPassword } 
    }),
};

// User endpoints
export const userApi = {
  getAll: () => 
    request('/api/users'),
  
  getById: (id: number) => 
    request(`/api/users/${id}`),
  
  updateProfile: (data: { username?: string }) =>
    request('/api/profile', { method: 'PUT', body: data }),
  
  uploadProfilePicture: (formData: FormData) =>
    request('/api/profile/picture', { 
      method: 'POST', 
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    }),
};

// Division endpoints
export const divisionApi = {
  getAll: () => 
    request('/api/divisions'),
  
  create: (name: string) =>
    request('/api/divisions', { method: 'POST', body: { name } }),
  
  delete: (id: number) =>
    request(`/api/divisions/${id}`, { method: 'DELETE' }),
  
  assignMember: (divisionId: number, userId: number) =>
    request(`/api/divisions/${divisionId}/members`, { 
      method: 'POST', 
      body: { user_id: userId } 
    }),
  
  removeMember: (divisionId: number, userId: number) =>
    request(`/api/divisions/${divisionId}/members/${userId}`, { method: 'DELETE' }),
  
  setAttendancePermission: (divisionId: number, canMark: boolean) =>
    request(`/api/divisions/${divisionId}/permissions`, { 
      method: 'PUT', 
      body: { can_mark_attendance: canMark } 
    }),
};

// Session endpoints
export const sessionApi = {
  getAll: () => 
    request('/api/sessions'),
  
  create: (name: string, date: string) =>
    request('/api/sessions', { method: 'POST', body: { name, date } }),
  
  delete: (id: number) =>
    request(`/api/sessions/${id}`, { method: 'DELETE' }),
};

// Attendance endpoints
export const attendanceApi = {
  getBySession: (sessionId: number) =>
    request(`/api/sessions/${sessionId}/attendance`),
  
  getByUser: (userId: number) =>
    request(`/api/users/${userId}/attendance`),
  
  getMyAttendance: () =>
    request('/api/my-attendance'),
  
  getMySummary: () =>
    request('/api/my-attendance/summary'),
  
  mark: (sessionId: number, userId: number, status: 'present' | 'absent' | 'excused') =>
    request('/api/attendance', { 
      method: 'POST', 
      body: { session_id: sessionId, user_id: userId, status } 
    }),
  
  bulkMark: (sessionId: number, records: Array<{ user_id: number; status: string }>) =>
    request('/api/attendance/bulk', { 
      method: 'POST', 
      body: { session_id: sessionId, records } 
    }),
};

// Calendar endpoints
export const calendarApi = {
  getEvents: (month?: number, year?: number) =>
    request(`/api/calendar${month && year ? `?month=${month}&year=${year}` : ''}`),
  
  getHijriDate: (date?: string) =>
    request(`/api/hijri${date ? `?date=${date}` : ''}`),
};

// Chat endpoints (AI chatbot)
export const chatApi = {
  sendMessage: (message: string) =>
    request('/api/chat', { method: 'POST', body: { message } }),
};

export default {
  auth: authApi,
  users: userApi,
  divisions: divisionApi,
  sessions: sessionApi,
  attendance: attendanceApi,
  calendar: calendarApi,
  chat: chatApi,
};
