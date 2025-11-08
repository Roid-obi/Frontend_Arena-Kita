export interface User {
  id?: string;
  full_name: string;
  email: string;
  phone_number: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
}

export interface AuthContextType {
  user: User | null;
  userType: 'user' | 'owner' | null;
  login: (email: string, password: string, type: 'user' | 'owner') => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}