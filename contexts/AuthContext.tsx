"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { User, RegisterData, AuthContextType, LoginResponse, VerifyOtpData, VerifyOtpResponse } from "@/types/auth";
import { API_BASE_URL } from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = API_BASE_URL.replace("/v1", "");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = Cookies.get("user");
    const savedToken = Cookies.get("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, type: "user" | "owner", recaptchaToken?: string) => {
    try {
      const endpoint = type === "user" ? "/v1/auth/user/login" : "/v1/auth/owner/login";

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          ...(recaptchaToken && { captcha_token: recaptchaToken }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data: LoginResponse = await response.json();

      if (data.status === "success") {
        // Simpan user data dan token ke state dan cookies
        setUser(data.data.user);
        setToken(data.data.token);

        Cookies.set("user", JSON.stringify(data.data.user), { expires: 7 });
        Cookies.set("token", data.data.token, { expires: 7 });
        Cookies.set("userRole", data.data.user.role, { expires: 7 }); // Simpan role dari API
        // Kembalikan role untuk digunakan oleh pemanggil (mis. redirect setelah login)
        return data.data.user.role;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log("Sending registration data:", { ...data, password: "***", password_confirmation: "***" });

      const response = await fetch(`${API_BASE}/v1/auth/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log("Registration response:", responseData);

      if (!response.ok) {
        // Extract detailed error message from backend
        const errorMessage = responseData.message || responseData.error || "Registrasi gagal";
        const errors = responseData.errors || responseData.data?.errors;

        if (errors) {
          // If there are validation errors, format them
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join("; ");
          throw new Error(errorMessages || errorMessage);
        }

        throw new Error(errorMessage);
      }

      if (responseData.status === "success") {
        // Registration successful, now user needs to verify OTP
        // Don't auto login, just return
        return;
      } else {
        throw new Error(responseData.message || "Registrasi gagal");
      }
    } catch (error) {
      console.error("Registrasi error:", error);
      throw error;
    }
  };

  const verifyOtp = async (data: VerifyOtpData) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/user/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verifikasi OTP gagal");
      }

      const responseData: VerifyOtpResponse = await response.json();

      if (responseData.status === "success") {
        // Auto login after OTP verification
        setUser(responseData.data.user);
        setToken(responseData.data.token);

        Cookies.set("user", JSON.stringify(responseData.data.user), { expires: 7 });
        Cookies.set("token", responseData.data.token, { expires: 7 });
        Cookies.set("userRole", responseData.data.user.role, { expires: 7 });
        return responseData.data.user.role;
      } else {
        throw new Error(responseData.message || "Verifikasi OTP gagal");
      }
    } catch (error) {
      console.error("Verifikasi OTP error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const currentToken = Cookies.get("token");

      // Panggil API logout hanya jika ada token
      if (currentToken) {
        await fetch(`${API_BASE}/v1/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear state dan cookies
      setUser(null);
      setToken(null);
      Cookies.remove("user");
      Cookies.remove("token");
      Cookies.remove("userRole");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        verifyOtp,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
