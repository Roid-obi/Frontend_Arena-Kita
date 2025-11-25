"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import RegisterModal from "@/components/RegisterModal";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (user.role === "owner") {
        router.push("/dashboard/owner");
      } else {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9fafb", color: "#1a1a1a" }}>
      <Navbar />
      <RegisterModal isOpen={true} onClose={() => router.push("/")} onSwitchToLogin={() => router.push("/login")} />
    </div>
  );
}
