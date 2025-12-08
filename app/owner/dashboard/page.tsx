"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BarChart2, Clock, Wallet } from "lucide-react";

interface OwnerStats {
  total_bookings: number;
  pending_bookings: number;
  total_income: string;
  raw_total_income: number;
}

const STATS_URL = "https://dev.api.arenakita.my.id/api/v1/owners/dashboard/stats";

export default function OwnerDashboardHome() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
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

        const response = await fetch(STATS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success" && result.data) {
          setStats(result.data);
        } else {
          setError(result.message || "Gagal mengambil statistik dashboard");
        }
      } catch (err) {
        console.error("Error fetching owner stats:", err);
        setError("Terjadi kesalahan saat mengambil statistik dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Dashboard Owner</h1>
        <p className="text-gray-600">Ringkasan cepat booking, status pending, dan total pendapatan.</p>
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
          <StatCard title="Total Booking" value={stats?.total_bookings ?? 0} icon={<BarChart2 className="text-[#0d47a1]" />} highlight="Semua booking masuk" />
          <StatCard title="Booking Pending" value={stats?.pending_bookings ?? 0} icon={<Clock className="text-amber-500" />} highlight="Menunggu konfirmasi" />
          <StatCard title="Total Pendapatan" value={stats?.total_income ?? "Rp 0"} icon={<Wallet className="text-emerald-600" />} highlight="Sudah termasuk semua transaksi" />
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
    <div className="rounded-xl bg-white shadow-md p-5 border border-gray-100">
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
