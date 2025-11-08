'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User, LoginData, RegisterData, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://127.0.0.1:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'user' | 'owner' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = Cookies.get('user');
    const savedUserType = Cookies.get('userType');

    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType as 'user' | 'owner');
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
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Simpan user data ke state dan cookies
      const userData: User = {
        id: data.user?.id,
        full_name: data.user?.full_name || '',
        email: data.user?.email || email,
        phone_number: data.user?.phone_number || '',
      };

      setUser(userData);
      setUserType(type);
      
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      Cookies.set('userType', type, { expires: 7 });
      Cookies.set('token', data.token || 'dummy-token', { expires: 7 }); // Ganti dengan token sebenarnya dari API

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
        throw new Error('Registration failed');
      }

      // Auto login setelah register
      await login(data.email, data.password, 'user');

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Panggil API logout
      await fetch(`${API_BASE}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state dan cookies
      setUser(null);
      setUserType(null);
      Cookies.remove('user');
      Cookies.remove('userType');
      Cookies.remove('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userType, login, register, logout, isLoading }}>
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