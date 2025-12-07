"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import OwnerLoginModal from "@/components/OwnerLoginModal";
import Navbar from "@/components/Navbar";

export default function OwnerLoginPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/login");
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
      <OwnerLoginModal isOpen={true} onClose={() => router.push("/")} />
    </div>
  );
}
