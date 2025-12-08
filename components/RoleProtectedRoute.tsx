"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "admin" | "owner" | "user";
}

export default function RoleProtectedRoute({ children, allowedRole }: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Jika user belum login, redirect ke halaman login sesuai role
      if (!user) {
        if (allowedRole === "owner") {
          router.push("/owner/login");
        } else if (allowedRole === "admin") {
          router.push("/login");
        } else {
          router.push("/login");
        }
        return;
      }

      // Jika user sudah login tapi role tidak sesuai, redirect ke halaman yang sesuai dengan role mereka
      if (user.role !== allowedRole) {
        if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (user.role === "owner") {
          router.push("/owner/dashboard");
        } else if (user.role === "user") {
          router.push("/user/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  }, [user, isLoading, allowedRole, router]);

  // Tampilkan loading saat mengecek autentikasi
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Jika user tidak ada atau role tidak sesuai, jangan render children
  if (!user || user.role !== allowedRole) {
    return null;
  }

  // Jika user ada dan role sesuai, render children
  return <>{children}</>;
}
