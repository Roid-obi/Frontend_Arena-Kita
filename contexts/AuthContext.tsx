'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User, LoginData, RegisterData, AuthContextType, LoginResponse, RegisterResponse } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'https://dev.api.arenakita.my.id/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = Cookies.get('user');
    const savedToken = Cookies.get('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, type: 'user' | 'owner') => {
    try {
      const endpoint = type === 'user' 
        ? '/v1/auth/user/login'
        : '/v1/auth/owner/login';

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      if (data.status === 'success') {
        // Simpan user data dan token ke state dan cookies
        setUser(data.data.user);
        setToken(data.data.token);
        
        Cookies.set('user', JSON.stringify(data.data.user), { expires: 7 });
        Cookies.set('token', data.data.token, { expires: 7 });
        Cookies.set('userRole', data.data.user.role, { expires: 7 }); // Simpan role dari API
        // Kembalikan role untuk digunakan oleh pemanggil (mis. redirect setelah login)
        return data.data.user.role;
      } else {
        throw new Error(data.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const responseData: RegisterResponse = await response.json();
      
      if (responseData.status === 'success') {
        // Auto login setelah register berhasil
        setUser(responseData.data.user);
        setToken(responseData.data.token);
        
        Cookies.set('user', JSON.stringify(responseData.data.user), { expires: 7 });
        Cookies.set('token', responseData.data.token, { expires: 7 });
        Cookies.set('userRole', responseData.data.user.role, { expires: 7 });
        return responseData.data.user.role;
      } else {
        throw new Error(responseData.message || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const currentToken = Cookies.get('token');
      
      // Panggil API logout hanya jika ada token
      if (currentToken) {
        await fetch(`${API_BASE}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear state dan cookies
      setUser(null);
      setToken(null);
      Cookies.remove('user');
      Cookies.remove('token');
      Cookies.remove('userRole');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}