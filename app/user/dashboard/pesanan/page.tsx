"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import bookingsData from "@/data/dummy/bookings.json";

interface RawBooking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  booking_status: string;
  created_at: string;
}

interface VenueInfo {
  venue_name: string;
  field_name: string;
  sport_type: string;
}

interface UserBooking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  raw_total_price: number;
  status: string;
  created_at: string;
  venue_info: VenueInfo;
}

export default function DashboardPesanan() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadDummyBookings = async () => {
      try {
        // Data venue/lapangan dummy untuk melengkapi tampilan
        const dummyVenues: VenueInfo[] = [
          { venue_name: "Arena Futsal A", field_name: "Lapangan 1", sport_type: "Futsal" },
          { venue_name: "GOR Serbaguna B", field_name: "Court Utama", sport_type: "Badminton" },
          { venue_name: "Soccer Hub C", field_name: "Pitch 2", sport_type: "Sepak Bola" },
          { venue_name: "Basket Center D", field_name: "Hall 3", sport_type: "Basket" },
        ];

        const mapped: UserBooking[] = (bookingsData as RawBooking[]).map((b, idx) => {
          const venue = dummyVenues[idx % dummyVenues.length];
          const rawStatus = b.booking_status.toLowerCase();

          // Petakan status legacy ke status tampilan baru
          let status = rawStatus;
          if (rawStatus === "pending") status = idx % 2 === 0 ? "menunggu pembayaran" : "menunggu konfirmasi";
          else if (rawStatus === "confirmed") status = "terkonfirmasi";
          else if (rawStatus === "canceled") status = "pesanan gagal";

          return {
            id: b.id,
            booking_date: b.booking_date,
            start_time: b.start_time,
            end_time: b.end_time,
            total_price: `Rp ${Number(b.total_price).toLocaleString("id-ID")}`,
            raw_total_price: Number(b.total_price),
            status,
            created_at: b.created_at,
            venue_info: venue,
          };
        });

        setBookings(mapped);
      } catch (err) {
        console.error("Error loading dummy bookings:", err);
        setError("Terjadi kesalahan saat memuat data pesanan");
      } finally {
        setLoading(false);
      }
    };

    loadDummyBookings();
  }, []);

  // Filter bookings berdasarkan search query
  const filteredBookings = bookings.filter(
    (b) =>
      b.id.toString().includes(searchQuery) ||
      b.venue_info.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.venue_info.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    if (statusLower.includes("pembayaran")) return "bg-blue-100 text-blue-800";
    if (statusLower.includes("konfirmasi")) return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("terkonfirmasi")) return "bg-green-100 text-green-800";
    if (statusLower.includes("selesai")) return "bg-emerald-100 text-emerald-800";
    if (statusLower.includes("gagal")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pembayaran")) return "Menunggu Pembayaran";
    if (statusLower.includes("konfirmasi")) return "Menunggu Konfirmasi";
    if (statusLower.includes("terkonfirmasi")) return "Terkonfirmasi";
    if (statusLower.includes("selesai")) return "Selesai";
    if (statusLower.includes("gagal")) return "Pesanan Gagal";
    return status;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Saya</h1>
      <p className="text-gray-600 mb-4">Status pesanan dan riwayat pemesanan Anda.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Cari pesanan..." />
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
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
                      <td className="px-4 py-3 text-sm text-gray-700">{b.venue_info.venue_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.venue_info.field_name}</td>
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
