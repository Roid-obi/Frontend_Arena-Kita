"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ShoppingCart, User, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import OwnerLoginModal from "./OwnerLoginModal";
import Link from "next/link";
import Logo from "@/assets/Image/Logo.png";

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOwnerLoginModal, setShowOwnerLoginModal] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const { user, token, logout, isLoading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 shadow-md bg-white relative">
      <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <Image src={Logo} alt="ArenaKita" height={40} className="object-contain" />
                {/* <div className="hidden md:block text-2xl font-bold text-[#0d47a1]">ArenaKita</div> */}
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari venue atau olahraga..."
                className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 border border-gray-200"
                style={{ backgroundColor: "#f3f4f6", color: "#1a1a1a" }}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={20} />
              </div>
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {user && token ? (
                <>
                  <button className="p-2 rounded-lg  hover:bg-[#0d48a188] transition text-[#0d47a1]">
                    <ShoppingCart size={24} />
                  </button>

                  <div className="relative">
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="p-2 rounded-lg hover:bg-[#0d48a188] transition text-[#0d47a1]">
                      <User size={24} />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                        {isLoading ? (
                          <div className="w-48 px-4 py-2 text-sm text-gray-600">Memuat...</div>
                        ) : (
                          <>
                            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                              <LayoutDashboard size={18} />
                              <span>{user.full_name || "Dashboard"}</span>
                            </button>
                            <button
                              onClick={async () => {
                                await logout();
                                setShowProfileMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <LogOut size={18} />
                              <span>Keluar</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setShowLoginModal(true)} className="bg-[#0d47a1] hover:bg-[#083055] text-white px-4 py-2 rounded-md transition duration-200">
                    Masuk
                  </button>
                  <button onClick={() => setShowRegisterModal(true)} className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-md transition duration-200">
                    Daftar
                  </button>
                  <button onClick={() => setShowOwnerLoginModal(true)} className="bg-[#06b6d4] hover:bg-[#0891b2] text-white px-4 py-2 rounded-md transition duration-200">
                    Masuk Owner
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <button onClick={() => setShowHamburger(!showHamburger)} className="p-2 rounded-md text-[#0d47a1]">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Menu (full width content) */}
      {showHamburger && (
        <div className="md:hidden w-full bg-white border-t shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {user && token ? (
              <>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3">
                  <ShoppingCart size={20} />
                  <span>Keranjang</span>
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  <User size={20} />
                  <span>Profil</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3"
                  onClick={async () => {
                    await logout();
                    setShowHamburger(false);
                  }}
                >
                  <LogOut size={20} />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setShowHamburger(false);
                  }}
                  className="w-full block px-4 py-2 bg-[#0d47a1] hover:bg-[#083055] text-white rounded-md"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    setShowRegisterModal(true);
                    setShowHamburger(false);
                  }}
                  className="w-full block px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-md"
                >
                  Daftar
                </button>
                <button
                  onClick={() => {
                    setShowOwnerLoginModal(true);
                    setShowHamburger(false);
                  }}
                  className="w-full block px-4 py-2 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded-md"
                >
                  Masuk Owner
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSwitchToLogin={() => setShowLoginModal(true)} />
      <OwnerLoginModal isOpen={showOwnerLoginModal} onClose={() => setShowOwnerLoginModal(false)} />
    </nav>
  );
}
