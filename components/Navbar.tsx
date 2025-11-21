"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, token, logout, isLoading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: '#0d47a1' }}>
      <div className="mx-auto px-4 md:px-8 lg:px-[120px] py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white">ArenaKita</div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari venue atau olahraga..."
                className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#f9fafb', color: '#1a1a1a' }}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            {user && token ? (
              <>
                <button className="p-2 rounded-lg hover:bg-blue-800 transition text-white">
                  <ShoppingCartIcon />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="p-2 rounded-lg hover:bg-blue-800 transition text-white"
                  >
                    <UserIcon />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                      {isLoading ? (
                        <div className="w-48 px-4 py-2 text-sm text-gray-600">Loading...</div>
                      ) : (
                        <>
                          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                            <DashboardIcon />
                            <span>{user.full_name || 'Dashboard'}</span>
                          </button>
                          <button
                            onClick={async () => { await logout(); setShowProfileMenu(false); }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <LogOutIcon />
                            <span>Logout</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
