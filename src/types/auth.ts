export type UserRole = 'student' | 'teacher' | 'admin';

export type AccountStatus = 'active' | 'pending_approval' | 'disabled';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  classYear?: string;
  rollNumber?: string;
  designation?: string;
  status: AccountStatus;
  mustChangePassword?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentRosterEntry {
  id: string;
  rollNumber: string;
  name: string;
  institutionalEmail: string;
  department: string;
  year: string;
  semester: string;
  isRegistered: boolean;
  registeredUserId?: string;
}

export interface StaffAccessRequest {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
