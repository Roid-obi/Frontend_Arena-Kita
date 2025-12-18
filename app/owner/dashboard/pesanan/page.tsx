"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api";

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
  user: User;
  field_info: FieldInfo;
}

// Using centralized API_BASE_URL from lib/api

type StatusTab = "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED" | "FAILED";

export default function OwnerPesanan() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<StatusTab>("PENDING");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusCounts, setStatusCounts] = useState<{ [key in StatusTab]: number }>({
    PENDING: 0,
    CONFIRMED: 0,
    REJECTED: 0,
    COMPLETED: 0,
    FAILED: 0,
  });
  const itemsPerPage = 5;

  const fetchStatusCounts = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const statuses: StatusTab[] = ["PENDING", "CONFIRMED", "REJECTED", "COMPLETED", "FAILED"];
      const counts: { [key in StatusTab]: number } = {
        PENDING: 0,
        CONFIRMED: 0,
        REJECTED: 0,
        COMPLETED: 0,
        FAILED: 0,
      };

      for (const status of statuses) {
        const response = await fetch(`${API_BASE_URL}/owners/bookings?status=${status}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (response.ok && result.status === "success" && Array.isArray(result.data)) {
          counts[status] = result.data.length;
        }
      }

      setStatusCounts(counts);
    } catch (err) {
      console.error("Error fetching status counts:", err);
    }
  };

  const refetchBookings = async (status: StatusTab = activeTab) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan");
        return;
      }

      const url = `${API_BASE_URL}/owners/bookings?status=${status}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success" && result.data) {
        setBookings(result.data);
        setError("");
      } else {
        setError(result.message || "Gagal mengambil data pesanan");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Terjadi kesalahan saat mengambil data pesanan");
    }
  };

  useEffect(() => {
    setLoading(true);
    refetchBookings(activeTab).finally(() => setLoading(false));
    fetchStatusCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Filter bookings berdasarkan search query saja (status sudah difilter oleh API)
  const filteredBookings = bookings.filter((b) => {
    // Filter by search query
    const matchesSearch =
      b.id.toString().includes(searchQuery) ||
      b.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.field_info.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_date.includes(searchQuery);

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

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
    if (statusUpper === "PENDING") return "Menunggu Konfirmasi";
    if (statusUpper === "CONFIRMED") return "Terkonfirmasi";
    if (statusUpper === "COMPLETED") return "Selesai";
    if (statusUpper === "REJECTED") return "Ditolak";
    if (statusUpper === "CANCELLED") return "Dibatalkan";
    if (statusUpper === "FAILED") return "Gagal";
    return status;
  };

  const handleApprove = async (bookingId: number) => {
    if (!confirm("Setujui booking ini?")) return;

    try {
      setActionLoading(bookingId);
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/owners/bookings/${bookingId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success" && result.data) {
        alert(result.message || "Booking berhasil disetujui");
        // Refetch bookings to update the list immediately
        await refetchBookings(activeTab);
      } else {
        throw new Error(result.message || "Gagal menyetujui booking");
      }
    } catch (err) {
      console.error("Error approving booking:", err);
      alert((err instanceof Error ? err.message : String(err)) || "Terjadi kesalahan saat menyetujui booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: number) => {
    if (!confirm("Tolak booking ini? Tindakan tidak dapat dibatalkan.")) return;

    try {
      setActionLoading(bookingId);
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/owners/bookings/${bookingId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success" && result.data) {
        alert(result.message || "Booking berhasil ditolak");
        // Refetch bookings to update the list immediately
        await refetchBookings(activeTab);
      } else {
        throw new Error(result.message || "Gagal menolak booking");
      }
    } catch (err) {
      console.error("Error rejecting booking:", err);
      alert((err instanceof Error ? err.message : String(err)) || "Terjadi kesalahan saat menolak booking");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Masuk</h1>
      <p className="text-gray-600 mb-4">Lihat pesanan yang masuk untuk semua venue Anda.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="w-full md:w-64">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari pesanan..." />
        </div>
      </div>

      {/* Tab Filter */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200">
        {[
          { key: "PENDING", label: "Menunggu" },
          { key: "CONFIRMED", label: "Disetujui" },
          { key: "REJECTED", label: "Ditolak" },
          { key: "COMPLETED", label: "Selesai" },
          { key: "FAILED", label: "Gagal" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as StatusTab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key ? "border-[#0d47a1] text-[#0d47a1]" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {tab.label} <span className="ml-2 inline-block bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">{statusCounts[tab.key as StatusTab]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0d47a1]" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe Olahraga</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBookings.map((b, index) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{b.user.name}</p>
                          <p className="text-xs text-gray-500">{b.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.field_info.field_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.field_info.sport_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.booking_date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {b.start_time} - {b.end_time}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{b.total_price}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(b.status)}`}>{getStatusLabel(b.status)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-1 flex-wrap">
                          {b.status === "PENDING" && <span className="text-xs text-gray-500">-</span>}
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleReject(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === b.id ? "..." : "Reject"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && <div className="p-4 text-center text-gray-500">Tidak ada pesanan yang cocok dengan pencarian</div>}
            </div>
            {filteredBookings.length > 0 && filteredBookings.length > itemsPerPage && (
              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
