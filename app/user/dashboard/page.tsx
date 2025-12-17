"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BookOpen, Clock, TrendingUp, User, Mail, Phone, MapPin, Calendar } from "lucide-react";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  photo_url: string | null;
}

interface UserStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  rejected_bookings: number;
  failed_bookings?: number;
}

interface Booking {
  booking_status: string;
  raw_total_price?: string;
  total_price?: string;
}

export default function UserDashboardHome() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
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

        // Fetch user profile
        const profileResponse = await fetch("https://dev.api.arenakita.my.id/api/v1/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Gagal mengambil data profil");
        }

        const profileResult = await profileResponse.json();
        if (profileResult.status === "success" && profileResult.data) {
          setProfile(profileResult.data);
        }

        // Fetch booking stats - menggunakan endpoint bookings untuk count
        const bookingsResponse = await fetch("https://dev.api.arenakita.my.id/api/v1/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (bookingsResponse.ok) {
          const bookingsResult = await bookingsResponse.json();
          if (bookingsResult.status === "success" && bookingsResult.data) {
            const bookings = bookingsResult.data;

            // Calculate stats from bookings data
            const totalBookings = bookings.length;
            const pendingCount = bookings.filter((b: Booking) => b.booking_status?.toUpperCase() === "PENDING").length;
            const confirmedCount = bookings.filter((b: Booking) => b.booking_status?.toUpperCase() === "CONFIRMED").length;
            const completedCount = bookings.filter((b: Booking) => b.booking_status?.toUpperCase() === "COMPLETED").length;
            const rejectedCount = bookings.filter((b: Booking) => b.booking_status?.toUpperCase() === "REJECTED").length;
            const failedCount = bookings.filter((b: Booking) => b.booking_status?.toUpperCase() === "FAILED").length;

            setStats({
              total_bookings: totalBookings,
              pending_bookings: pendingCount,
              confirmed_bookings: confirmedCount,
              completed_bookings: completedCount,
              rejected_bookings: rejectedCount,
              failed_bookings: failedCount,
            });
          }
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
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Dashboard Pengguna</h1>
        <p className="text-gray-600">Ringkasan cepat profil, pesanan, dan aktivitas terbaru Anda.</p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <>
          <div className="mb-8 h-48 rounded-xl bg-gray-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* User Profile Card */}
          {profile && (
            <div className="bg-gradient-to-r from-[#0d47a1] to-[#1a5490] text-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {profile.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photo_url.startsWith("http") ? profile.photo_url : `https://dev.api.arenakita.my.id/storage/${profile.photo_url}`}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                    <User size={48} />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">{profile.full_name}</h2>
                  <div className="space-y-2 text-sm opacity-90">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {(profile.city || profile.address) && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{profile.city || profile.address}</span>
                      </div>
                    )}
                    {profile.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Member sejak {new Date(profile.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard title="Total Pemesanan" value={stats?.total_bookings ?? 0} icon={<BookOpen className="text-[#0d47a1]" size={24} />} highlight="Semua pesanan Anda" bgColor="bg-blue-50" />
            <StatCard title="Pesanan Pending" value={stats?.pending_bookings ?? 0} icon={<Clock className="text-amber-500" size={24} />} highlight="Menunggu konfirmasi" bgColor="bg-amber-50" />
            <StatCard
              title="Pesanan Berhasil"
              value={stats?.confirmed_bookings ?? 0}
              icon={<TrendingUp className="text-green-600" size={24} />}
              highlight="Pesanan dikonfirmasi"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Pesanan Selesai"
              value={stats?.completed_bookings ?? 0}
              icon={<BookOpen className="text-emerald-600" size={24} />}
              highlight="Pesanan yang selesai"
              bgColor="bg-emerald-50"
            />
            <StatCard title="Pesanan Ditolak" value={stats?.rejected_bookings ?? 0} icon={<Clock className="text-red-500" size={24} />} highlight="Pesanan ditolak" bgColor="bg-red-50" />
            <StatCard title="Pesanan Gagal" value={stats?.failed_bookings ?? 0} icon={<BookOpen className="text-orange-500" size={24} />} highlight="Pesanan yang gagal" bgColor="bg-orange-50" />
          </div>

          {/* Additional Stats */}
          {stats && (stats.failed_bookings || stats.rejected_bookings) && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>}
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
