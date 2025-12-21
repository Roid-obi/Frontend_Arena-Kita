"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { API_BASE_URL, getStorageUrl } from "@/lib/api";

interface BookingHistory {
  id: number;
  venue: string;
  field: string;
  date: string;
  status: string;
}

interface UserDetail {
  id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  profile_photo_url: string | null;
  email_verified_at: string | null;
  joined_at: string;
  booking_history: BookingHistory[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: UserDetail;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBanModal, setShowBanModal] = useState(false);
  const [banLoading, setBanLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const token = Cookies.get("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil detail user: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.status === "success" && result.data) {
          setUserDetail(result.data);
        } else {
          setError(result.message || "Terjadi kesalahan");
        }
      } catch (err) {
        console.error("Error fetching user detail:", err);
        setError("Terjadi kesalahan saat mengambil detail user");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserDetail();
    }
  }, [id, router]);

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "bg-yellow-100 text-yellow-800";
    if (statusUpper === "CONFIRMED") return "bg-green-100 text-green-800";
    if (statusUpper === "COMPLETED") return "bg-emerald-100 text-emerald-800";
    if (statusUpper === "REJECTED") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "Menunggu";
    if (statusUpper === "CONFIRMED") return "Berhasil";
    if (statusUpper === "COMPLETED") return "Selesai";
    if (statusUpper === "REJECTED") return "Ditolak";
    return status;
  };

  const handleBanUser = async () => {
    try {
      setBanLoading(true);
      setError("");
      const token = Cookies.get("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menonaktifkan user");
      }

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage(result.message || "User berhasil dinonaktifkan");
        setShowBanModal(false);

        // Redirect to user list after 2 seconds
        setTimeout(() => {
          router.push("/admin/dashboard/user");
        }, 2000);
      } else {
        setError(result.message || "Gagal menonaktifkan user");
      }
    } catch (err) {
      console.error("Error banning user:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setShowBanModal(false);
    } finally {
      setBanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0d47a1]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
        <Link href="/admin/dashboard/user" className="text-[#0d47a1] hover:underline">
          &larr; Kembali ke Daftar User
        </Link>
      </div>
    );
  }

  if (!userDetail) {
    return null;
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin/dashboard/user" className="text-[#0d47a1] hover:underline flex items-center gap-2">
          <span>&larr;</span> Kembali
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Detail User</h1>
        <button onClick={() => setShowBanModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">
          Nonaktifkan User
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
      {successMessage && <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3 text-sm">{successMessage}</div>}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            {userDetail.profile_photo_url ? (
              <img src={getStorageUrl(userDetail.profile_photo_url)} alt={userDetail.full_name} className="w-24 h-24 rounded-full object-cover border-4 border-[#0d47a1]" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#0d47a1] text-white flex items-center justify-center text-3xl font-bold border-4 border-[#0d47a1]">
                {userDetail.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{userDetail.full_name}</h2>
              <p className="text-gray-600">{userDetail.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">{userDetail.role}</span>
            </div>
          </div>
        </div>

        {/* User Information Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID User</p>
              <p className="font-medium text-gray-800">#{userDetail.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">No. Telepon</p>
              <p className="font-medium text-gray-800">{userDetail.phone_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Terverifikasi</p>
              {userDetail.email_verified_at ? <p className="font-medium text-green-600">✓ {userDetail.email_verified_at}</p> : <p className="font-medium text-gray-500">Belum terverifikasi</p>}
            </div>
            <div>
              <p className="text-sm text-gray-500">Bergabung Sejak</p>
              <p className="font-medium text-gray-800">{userDetail.joined_at}</p>
            </div>
          </div>
        </div>

        {/* Booking History Section */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Pesanan</h2>
          {userDetail.booking_history.length > 0 ? (
            <div className="space-y-3">
              {userDetail.booking_history.map((booking) => (
                <div key={booking.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-600">Pesanan #{booking.id}</span>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.status)}`}>{getStatusLabel(booking.status)}</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{booking.venue}</p>
                      <p className="text-sm text-gray-600">{booking.field}</p>
                    </div>
                    <div className="text-sm text-gray-600 md:text-right">
                      <p className="font-medium">{booking.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500">Belum ada riwayat pesanan</div>
          )}
        </div>
      </div>

      {/* Ban User Confirmation Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Nonaktifkan User</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menonaktifkan user <span className="font-semibold">{userDetail?.full_name}</span>? Tindakan ini akan menghapus akses user ke sistem.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBanModal(false)}
                disabled={banLoading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleBanUser}
                disabled={banLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {banLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  "Ya, Nonaktifkan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
