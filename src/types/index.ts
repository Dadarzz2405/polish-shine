// Types matching Flask backend models

export type Role = 'admin' | 'ketua' | 'pembina' | 'anggota';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  profile_picture?: string;
  division_id?: number;
  must_change_password: boolean;
  created_at: string;
}

export interface Division {
  id: number;
  name: string;
  can_mark_attendance: boolean;
  members?: User[];
}

export interface Session {
  id: number;
  name: string;
  date: string;
  created_by: number;
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  session_id: number;
  status: 'present' | 'absent' | 'excused';
  marked_by: number;
  marked_at: string;
  user?: User;
  session?: Session;
}

export interface AttendanceSummary {
  total_sessions: number;
  present: number;
  absent: number;
  excused: number;
  attendance_rate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'session' | 'holiday';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}
