"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ShoppingCart, User, LayoutDashboard, LogOut, Menu, Home, X, Building2, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import OwnerLoginModal from "./OwnerLoginModal";
import Link from "next/link";
import Logo from "@/assets/image/Logo.png";

interface User {
  full_name?: string;
  role?: string;
  // Add other user properties as needed
}

function DropdownMenu({ user, isLoading, onLogout, onClose }: { user: User; isLoading: boolean; onLogout: () => void; onClose: () => void }) {
  const pathname = usePathname();

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "owner") return "/owner/dashboard";
    return "/user/dashboard";
  };

  const dashboardPath = getDashboardPath();
  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith(dashboardPath);

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
      {isLoading ? (
        <div className="px-4 py-2 text-sm text-gray-600">Memuat...</div>
      ) : (
        <>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.full_name || "Pengguna"}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || "user"}</p>
          </div>
          <Link href="/" onClick={onClose} className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 ${isHome ? "bg-blue-50 text-[#0d47a1] font-medium" : "text-gray-700"}`}>
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link
            href={dashboardPath}
            onClick={onClose}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 ${isDashboard ? "bg-blue-50 text-[#0d47a1] font-medium" : "text-gray-700"}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <button onClick={onLogout} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 text-red-600">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOwnerLoginModal, setShowOwnerLoginModal] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<{ id: number; venue_name: string; city: string }[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const { user, token, logout, isLoading } = useAuth();
  const pathname = usePathname();

  // Fetch venues for autocomplete
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("https://dev.api.arenakita.my.id/api/v1/venues");
        const result = await response.json();
        if (result.status === "success" && result.data) {
          setVenues(result.data);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, []);

  // Fetch user profile for photo
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setProfilePhotoUrl(null);
        return;
      }
      try {
        const response = await fetch("https://dev.api.arenakita.my.id/api/v1/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.status === "success" && result.data?.profile_photo_url) {
          const photoUrl = result.data.profile_photo_url.startsWith("http") ? result.data.profile_photo_url : `https://dev.api.arenakita.my.id/storage/${result.data.profile_photo_url}`;
          setProfilePhotoUrl(photoUrl);
        } else {
          setProfilePhotoUrl(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfilePhotoUrl(null);
      }
    };
    fetchProfile();
  }, [token]);

  // Filter venues based on search query
  const filteredVenues = searchQuery.trim()
    ? venues.filter((venue) => venue.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) || venue.city.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "owner") return "/owner/dashboard";
    return "/user/dashboard";
  };

  const dashboardPath = getDashboardPath();

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
                placeholder="Cari venue atau lokasinya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                className="w-full h-10 px-4 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] border border-gray-300"
                style={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={20} />
              </div>

              {/* Autocomplete Dropdown */}
              {showAutocomplete && filteredVenues.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {filteredVenues.map((venue) => (
                    <Link
                      key={venue.id}
                      href={`/venue/${venue.id}`}
                      className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSearchQuery("");
                        setShowAutocomplete(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">{venue.venue_name}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Search size={14} className="mr-1" />
                        {venue.city}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Venues Link */}
              <Link
                href="/venues"
                className={`flex items-center gap-2 text-sm font-semibold h-9 px-4 rounded-lg transition-all ${
                  pathname === "/venues" ? "text-white bg-[#0d47a1] shadow-md" : "text-gray-700 hover:text-[#0d47a1] hover:bg-blue-50 border border-gray-200"
                }`}
              >
                <Building2 size={18} />
                <span>Semua Venue</span>
              </Link>

              {user && token ? (
                <>
                  {/* <button className="p-2 rounded-lg  hover:bg-[#0d48a154] transition text-[#0d47a1]">
                    <ShoppingCart size={24} />
                  </button> */}

                  <div className="relative">
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 px-2 py-[3px] rounded-lg hover:bg-gray-100 transition ">
                      {profilePhotoUrl ? (
                        <img
                          src={profilePhotoUrl}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center text-white font-semibold text-sm ${
                          profilePhotoUrl ? "hidden" : ""
                        }`}
                      >
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <ChevronDown size={16} className="text-gray-600" />
                    </button>

                    {showProfileMenu && (
                      <DropdownMenu
                        user={user}
                        isLoading={isLoading}
                        onLogout={async () => {
                          await logout();
                          setShowProfileMenu(false);
                        }}
                        onClose={() => setShowProfileMenu(false)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowOwnerLoginModal(true)}
                    className="border-2 border-[#0d47a1] hover:bg-[#0d47a1] text-[#0d47a1] hover:text-white px-4 py-[6px] rounded-md transition duration-200"
                  >
                    Owner Venue
                  </button>
                  <button onClick={() => setShowLoginModal(true)} className="bg-[#0d47a1] hover:bg-[#083055] text-white px-4 py-2 rounded-md transition duration-200">
                    Masuk
                  </button>
                  <button onClick={() => setShowRegisterModal(true)} className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-md transition duration-200">
                    Daftar
                  </button>
                </>
              )}
            </div>

            {/* Mobile search and hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="p-2 rounded-md text-[#0d47a1] transition">
                <Search size={24} />
              </button>
              <button onClick={() => setShowHamburger(!showHamburger)} className="p-2 rounded-md text-[#0d47a1] transition">
                {showHamburger ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden w-full bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari venue atau olahraga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] border border-gray-300"
                style={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={20} />
              </div>

              {/* Autocomplete Dropdown */}
              {showAutocomplete && filteredVenues.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredVenues.map((venue) => (
                    <Link
                      key={venue.id}
                      href={`/venue/${venue.id}`}
                      className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSearchQuery("");
                        setShowAutocomplete(false);
                        setShowMobileSearch(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">{venue.venue_name}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Search size={14} className="mr-1" />
                        {venue.city}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Hamburger Menu (full width content) */}
      {showHamburger && (
        <div className="md:hidden w-full bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {user && token ? (
              <>
                <Link
                  href="/"
                  onClick={() => setShowHamburger(false)}
                  className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3 ${pathname === "/" ? "bg-blue-50 text-[#0d47a1] font-medium" : "text-gray-700"}`}
                >
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                <Link
                  href="/venues"
                  onClick={() => setShowHamburger(false)}
                  className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3 ${pathname === "/venues" ? "bg-blue-50 text-[#0d47a1] font-medium" : "text-gray-700"}`}
                >
                  <Search size={20} />
                  <span>Venues</span>
                </Link>
                <Link
                  href={dashboardPath}
                  onClick={() => setShowHamburger(false)}
                  className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3 ${
                    pathname.startsWith(dashboardPath) ? "bg-blue-50 text-[#0d47a1] font-medium" : "text-gray-700"
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <button
                  className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3 text-red-600"
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
                <Link
                  href="/"
                  onClick={() => setShowHamburger(false)}
                  className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3 ${pathname === "/" ? "bg-blue-50 text-[#0d47a1] font-medium" : "text-gray-700"}`}
                >
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                <Link
                  href="/venues"
                  onClick={() => setShowHamburger(false)}
                  className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-3 ${pathname === "/venues" ? "bg-blue-50 text-[#0d47a1] font-medium" : "text-gray-700"}`}
                >
                  <Search size={20} />
                  <span>Venues</span>
                </Link>
                <button
                  onClick={() => {
                    setShowOwnerLoginModal(true);
                    setShowHamburger(false);
                  }}
                  className="w-full block px-4 py-[6px] border-2 border-[#0d47a1] hover:bg-[#0d47a1] text-[#0d47a1] hover:text-white rounded-md transition duration-200"
                >
                  Owner Venue
                </button>
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
