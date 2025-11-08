'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';

export default function Home() {
  useEffect(() => {
    // Console log semua cookie
    const allCookies = Cookies.get();
    console.log('🛠️ DEBUG - All Cookies:', allCookies);
    
    // Cookie spesifik untuk autentikasi
    console.log('🔐 Auth Cookies:', {
      user: Cookies.get('user'),
      userType: Cookies.get('userType'),
      token: Cookies.get('token')
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-600">
              Welcome to Arena Kita
            </h1>
          </div>
        </div>
      </main>
    </div>
  );
}