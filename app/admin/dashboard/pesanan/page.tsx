import React from "react";

export default function AdminPesanan() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Kelola Pesanan</h1>
      <p className="text-gray-600 mb-4">Daftar semua pesanan yang masuk, status, dan opsi admin.</p>

      <div className="space-y-4">
        <div className="p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Pesanan #9001</h3>
              <p className="text-sm text-gray-600">User: Budi • Venue: Lapangan A • 2025-12-06 • 09:00</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#0d47a1] text-white rounded">Konfirmasi</button>
              <button className="px-3 py-1 bg-gray-200 rounded">Detail</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
