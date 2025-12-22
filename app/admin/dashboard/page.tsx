"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Users, Building2, TrendingUp, CreditCard } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import Skeleton from "@/components/Skeleton";

interface AdminStats {
  total_users: number;
  total_owners: number;
  total_venues: number;
  total_transactions: number;
  total_revenue: string;
  raw_total_revenue: number;
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        // Fetch admin dashboard stats
        const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!statsResponse.ok) {
          throw new Error("Gagal mengambil data statistik");
        }

        const statsResult = await statsResponse.json();
        if (statsResult.status === "success" && statsResult.data) {
          setStats(statsResult.data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Terjadi kesalahan saat mengambil data dashboard");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Dashboard Admin</h1>
        <p className="text-gray-600">Ringkasan sistem, statistik, dan aktivitas platform.</p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <>
          <Skeleton className="mb-8 h-48 w-full" rounded="xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full" rounded="xl" />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Total Revenue Card */}
          {stats && (
            <div className="bg-gradient-to-r from-[#0d47a1] to-[#1a5490] text-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <h2 className="text-4xl font-bold mt-2">{stats.total_revenue}</h2>
                  <p className="text-sm opacity-75 mt-2">Pendapatan total dari semua transaksi</p>
                </div>
                <div className="p-4 rounded-full bg-white/20 border border-white/30 flex-shrink-0">
                  <CreditCard size={40} />
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard title="Total Pengguna" value={stats?.total_users ?? 0} icon={<Users className="text-[#0d47a1]" size={24} />} highlight="Pengguna terdaftar di platform" bgColor="bg-blue-50" />
            <StatCard
              title="Total Pemilik Venue"
              value={stats?.total_owners ?? 0}
              icon={<Building2 className="text-emerald-600" size={24} />}
              highlight="Pemilik venue terdaftar"
              bgColor="bg-emerald-50"
            />
            <StatCard title="Total Venue" value={stats?.total_venues ?? 0} icon={<TrendingUp className="text-amber-500" size={24} />} highlight="Venue yang terdaftar" bgColor="bg-amber-50" />
            <StatCard
              title="Total Transaksi"
              value={stats?.total_transactions ?? 0}
              icon={<CreditCard className="text-purple-600" size={24} />}
              highlight="Transaksi yang berhasil"
              bgColor="bg-purple-50"
            />
          </div>
        </>
      )}
    </section>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  highlight: string;
  bgColor?: string;
};

function StatCard({ title, value, icon, highlight, bgColor = "bg-blue-50" }: StatCardProps) {
  return (
    <div className={`rounded-xl bg-white shadow-md p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
      </div>
      <p className="text-xs text-gray-500 mt-4">{highlight}</p>
    </div>
  );
}
