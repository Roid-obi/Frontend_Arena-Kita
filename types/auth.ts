// =====================
// USER MODEL
// =====================
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

  // Khusus owner
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

// =====================
// LOGIN
// =====================
export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// =====================
// REGISTER
// =====================
export interface RegisterData {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: User;
  };
}

// =====================
// VERIFY OTP
// =====================
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

// =====================
// AUTH CONTEXT
// =====================
export interface AuthContextType {
  user: User | null;
  token: string | null;

  /**
   * Login dengan optional reCAPTCHA token
   * - user login → pakai recaptcha
   * - owner/admin → bisa tanpa recaptcha
   */
  login: (
    email: string,
    password: string,
    type: "user" | "owner",
    recaptchaToken?: string
  ) => Promise<"user" | "owner" | "admin" | void>;

  register: (data: RegisterData) => Promise<void>;

  verifyOtp: (
    data: VerifyOtpData
  ) => Promise<"user" | "owner" | "admin" | void>;

  logout: () => Promise<void>;

  isLoading: boolean;
}
