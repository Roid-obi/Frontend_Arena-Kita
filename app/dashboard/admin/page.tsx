"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika belum load selesai dan belum ada user, biarkan
    if (!isLoading) {
      // Jika bukan admin, arahkan sesuai role: owner -> owner dashboard, user -> homepage
      if (!user) {
        router.push("/");
      } else if (user.role !== "admin") {
        if (user.role === "owner") {
          router.push("/dashboard/owner");
        } else {
          router.push("/");
        }
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
        <h1 className="text-3xl font-bold mb-4">Dashboard Admin</h1>
        <p className="text-sm text-gray-600 mb-6">Welcome back, {user.full_name} — this is the admin control panel.</p>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Venues</h3>
            <p className="text-3xl font-bold mt-4">—</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold mt-4">—</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Pending Approvals</h3>
            <p className="text-3xl font-bold mt-4">—</p>
          </div>
        </section>

        <section className="mt-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-x-2">
              <button className="px-4 py-2 rounded bg-[#0d47a1] text-white">Manage Venues</button>
              <button className="px-4 py-2 rounded bg-[#f97316] text-white">Manage Users</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
