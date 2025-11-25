"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function OwnerDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Jika bukan owner - arahkan ke tempat yang sesuai
      if (!user) {
        router.push("/");
      } else if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (user.role !== "owner") {
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto px-4 md:px-8 lg:px-[120px] py-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard Owner</h1>
        <p className="text-sm text-gray-600 mb-6">Welcome back, {user.full_name} — this is the owner control panel.</p>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">My Venues</h3>
            <p className="text-3xl font-bold mt-4">—</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Bookings</h3>
            <p className="text-3xl font-bold mt-4">—</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Earnings</h3>
            <p className="text-3xl font-bold mt-4">—</p>
          </div>
        </section>
      </main>
    </div>
  );
}
