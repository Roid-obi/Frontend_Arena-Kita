"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import bookingsData from "@/data/dummy/bookings.json";

export default function DashboardPesanan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter bookings berdasarkan search query
  const filteredBookings = bookingsData.filter((b) => b.id.toString().includes(searchQuery) || b.booking_date.includes(searchQuery));

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Saya</h1>
      <p className="text-gray-600 mb-4">Status pesanan dan riwayat pemesanan.</p>
      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Cari pesanan..." />
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.booking_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.start_time} - {b.end_time}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Rp {b.total_price.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        b.booking_status === "confirmed" ? "bg-green-100 text-green-800" : b.booking_status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {b.booking_status === "confirmed" ? "Dikonfirmasi" : b.booking_status === "pending" ? "Menunggu" : "Dibatalkan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="inline-flex items-center gap-2">
                      <button className="px-3 py-1 bg-[#0d47a1] text-white rounded text-sm">Detail</button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada pesanan yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredBookings.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </section>
  );
}
