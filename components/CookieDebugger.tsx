"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";

export default function CookieDebugger() {
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    const logCookies = () => {
      const allCookies = Cookies.get();
      const userCookie = Cookies.get("user");
      const tokenCookie = Cookies.get("token");
      const roleCookie = Cookies.get("userRole");

      console.log("🛠️ === COOKIE DEBUGGER ===");
      //   console.log('📦 All Cookies:', allCookies);
      console.log("👤 User Cookie:", userCookie ? JSON.parse(userCookie) : "Not found");
      console.log("🔑 Token Cookie:", tokenCookie ? `${tokenCookie.substring(0, 10)}...` : "Not found");
      console.log("🎭 Role Cookie:", roleCookie || "Not found");
      console.log("⚛️  Context User:", user);
      console.log("⚛️  Context Token:", token ? `${token.substring(0, 10)}...` : "Not found");
      //   console.log('🔄 Loading State:', isLoading);
      console.log("🛠️ ========================");
    };

    logCookies();

    // Optional: Log cookies ketika ada perubahan
    const interval = setInterval(logCookies, 5000); // Log setiap 5 detik
    return () => clearInterval(interval);
  }, [user, token, isLoading]);

  // Komponen ini tidak menampilkan UI, hanya untuk debugging
  return null;
}
