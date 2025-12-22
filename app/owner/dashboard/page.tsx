"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BarChart2, Clock, Wallet } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import Skeleton from "@/components/Skeleton";
import LoadingIndicator from "@/components/LoadingIndicator";

interface OwnerStats {
  total_bookings: number;
  pending_bookings: number;
  total_income: string;
  raw_total_income: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface FieldInfo {
  field_name: string;
  sport_type: string;
  venue_name: string;
}

interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  raw_total_price: number;
  status: string;
  created_at: string;
  created_at_human: string;
  user: User;
  field_info: FieldInfo;
}

// Using centralized API_BASE_URL from lib/api
// Stats and bookings URLs will be constructed dynamically

export default function OwnerDashboardHome() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/owners/dashboard/stats`, {
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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setBookingsError("Token tidak ditemukan");
          setBookingsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/owners/dashboard/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success" && result.data) {
          setBookings(result.data.slice(0, 10)); // Display latest 10 bookings
        } else {
          setBookingsError(result.message || "Gagal mengambil data booking");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookingsError("Terjadi kesalahan saat mengambil data booking");
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "bg-yellow-100 text-yellow-800";
    if (statusUpper === "CONFIRMED") return "bg-green-100 text-green-800";
    if (statusUpper === "COMPLETED") return "bg-emerald-100 text-emerald-800";
    if (statusUpper === "REJECTED" || statusUpper === "CANCELLED") return "bg-red-100 text-red-800";
    if (statusUpper === "FAILED") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "Menunggu";
    if (statusUpper === "CONFIRMED") return "Disetujui";
    if (statusUpper === "COMPLETED") return "Selesai";
    if (statusUpper === "REJECTED") return "Ditolak";
    if (statusUpper === "CANCELLED") return "Dibatalkan";
    if (statusUpper === "FAILED") return "Gagal";
    return status;
  };

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
            <Skeleton key={i} className="h-28 w-full" rounded="xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Booking" value={stats?.total_bookings ?? 0} icon={<BarChart2 className="text-[#0d47a1]" />} highlight="Semua booking masuk" />
          <StatCard title="Booking Pending" value={stats?.pending_bookings ?? 0} icon={<Clock className="text-amber-500" />} highlight="Menunggu konfirmasi" />
          <StatCard title="Total Pendapatan" value={stats?.total_income ?? "Rp 0"} icon={<Wallet className="text-emerald-600" />} highlight="Sudah termasuk semua transaksi" />
        </div>
      )}

      {/* Booking Masuk Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0d47a1]">Booking Masuk</h2>
        </div>

        {bookingsError && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{bookingsError}</div>}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {bookingsLoading ? (
            <div className="p-8">
              <LoadingIndicator label="Memuat booking terbaru..." />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada booking masuk</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((b, index) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700\">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{b.user.name}</p>
                          <p className="text-xs text-gray-500">{b.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{b.field_info.field_name}</p>
                          <p className="text-xs text-gray-500">{b.field_info.sport_type}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.field_info.venue_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.booking_date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {b.start_time} - {b.end_time}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{b.total_price}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(b.status)}`}>{getStatusLabel(b.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
