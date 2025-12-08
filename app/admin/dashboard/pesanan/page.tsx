"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import bookingsData from "@/data/dummy/bookings.json";

export default function AdminPesanan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter bookings berdasarkan search query
  const filteredBookings = bookingsData.filter((b) => b.id.toString().includes(searchQuery) || b.user_id.toString().includes(searchQuery));

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Kelola Pesanan</h1>
      <p className="text-gray-600 mb-4">Daftar semua pesanan yang masuk, status, dan opsi admin.</p>

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari pesanan..." />
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.user_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.booking_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.start_time} - {b.end_time}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        b.booking_status === "confirmed" ? "bg-green-100 text-green-800" : b.booking_status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {b.booking_status === "confirmed" ? "Dikonfirmasi" : b.booking_status === "pending" ? "Menunggu" : "Dibatalkan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <button className="px-3 py-1 bg-[#0d47a1] text-white rounded text-sm">Konfirmasi</button>
                      <button className="px-3 py-1 bg-gray-200 rounded text-sm">Detail</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && <div className="p-4 text-center text-gray-500">Tidak ada pesanan yang cocok dengan pencarian</div>}
        </div>
        {filteredBookings.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>
    </section>
  );
}
