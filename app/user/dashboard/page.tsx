"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BookOpen, Clock, TrendingUp } from "lucide-react";

interface UserStats {
  total_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
}

export default function UserDashboardHome() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        // Menggunakan dummy data karena API belum tersedia
        // Ketika API tersedia, ganti dengan:
        // const response = await fetch("https://dev.api.arenakita.my.id/api/v1/users/dashboard/stats", {...})

        // Dummy data untuk sementara
        setStats({
          total_bookings: 0,
          pending_bookings: 0,
          completed_bookings: 0,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError("Terjadi kesalahan saat mengambil statistik dashboard");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Dashboard Pengguna</h1>
        <p className="text-gray-600">Ringkasan cepat pesanan, status booking, dan aktivitas terbaru Anda.</p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Pemesanan" value={stats?.total_bookings ?? 0} icon={<BookOpen className="text-[#0d47a1]" />} highlight="Semua pesanan Anda" />
          <StatCard title="Pemesanan Pending" value={stats?.pending_bookings ?? 0} icon={<Clock className="text-amber-500" />} highlight="Menunggu konfirmasi" />
          <StatCard title="Selesai" value={stats?.completed_bookings ?? 0} icon={<TrendingUp className="text-emerald-600" />} highlight="Pesanan yang selesai" />
        </div>
      )}
    </section>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  highlight: string;
};

function StatCard({ title, value, icon, highlight }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white shadow-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold text-[#0d47a1]">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-blue-50 border border-blue-100">{icon}</div>
      </div>
      <p className="text-xs text-gray-500">{highlight}</p>
    </div>
  );
}
