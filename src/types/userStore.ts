export interface UserSession {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  isAuthenticated: boolean;
  roles: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  metadata: Record<string, string | number | boolean | Date | null>;
}
