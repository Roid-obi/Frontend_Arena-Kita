"use client";

import React, { useState } from "react";
import SearchBar from "@/components/SearchBar";
import bookingsData from "@/data/dummy/bookings.json";

export default function OwnerPesanan() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter bookings berdasarkan search query (untuk owner, biasanya filter by venue_id atau status)
  const filteredBookings = bookingsData.filter((b) =>
    b.id.toString().includes(searchQuery) ||
    b.user_id.toString().includes(searchQuery) ||
    b.booking_date.includes(searchQuery)
  );

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Masuk</h1>
      <p className="text-gray-600 mb-4">Lihat pesanan yang masuk untuk semua venue Anda.</p>

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari pesanan..." />
      </div>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{b.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{b.user_id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{b.venue_id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{b.booking_date}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{b.booking_time}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : b.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {b.status === "confirmed" ? "Dikonfirmasi" : b.status === "pending" ? "Menunggu" : "Dibatalkan"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="px-3 py-1 bg-[#0d47a1] text-white rounded text-sm">Detail</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="p-4 text-center text-gray-500">Tidak ada pesanan yang cocok dengan pencarian</div>
        )}
      </div>
    </section>
  );
}
