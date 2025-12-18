export interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: "user" | "owner" | "admin";
  created_at: string;
  updated_at: string;
  email_verified_at?: string | null;
  profile_photo_url?: string | null;
  deleted_at?: string | null;
  // Fields khusus owner
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: User;
  };
}

export interface VerifyOtpData {
  email: string;
  otp_code: string;
}

export interface VerifyOtpResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
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
  captcha_token?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, type: "user" | "owner") => Promise<"user" | "owner" | "admin" | void>;
  register: (data: RegisterData) => Promise<void>;
  verifyOtp: (data: VerifyOtpData) => Promise<"user" | "owner" | "admin" | void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
