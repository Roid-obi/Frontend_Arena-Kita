"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import Cookies from "js-cookie";

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

const BOOKINGS_URL = "https://dev.api.arenakita.my.id/api/v1/owners/dashboard/bookings";

export default function OwnerPesanan() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await fetch(BOOKINGS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success" && result.data) {
          setBookings(result.data);
        } else {
          setError(result.message || "Gagal mengambil data pesanan");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Terjadi kesalahan saat mengambil data pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings berdasarkan search query
  const filteredBookings = bookings.filter(
    (b) =>
      b.id.toString().includes(searchQuery) ||
      b.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.field_info.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_date.includes(searchQuery)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") return "bg-green-100 text-green-800";
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") return "Dikonfirmasi";
    if (statusLower === "pending") return "Menunggu";
    return "Dibatalkan";
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Masuk</h1>
      <p className="text-gray-600 mb-4">Lihat pesanan yang masuk untuk semua venue Anda.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari pesanan..." />
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe Olahraga</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{b.id}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && <div className="p-4 text-center text-gray-500">Tidak ada pesanan yang cocok dengan pencarian</div>}
            </div>
            {filteredBookings.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </>
        )}
      </div>
    </section>
  );
}
