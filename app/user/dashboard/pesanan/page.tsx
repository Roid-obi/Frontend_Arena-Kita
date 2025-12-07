import React from "react";

export default function DashboardPesanan() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Saya</h1>
      <p className="text-gray-600 mb-4">Status pesanan dan riwayat pemesanan akan ditampilkan di halaman ini.</p>

      <div className="space-y-4">
        <div className="p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Pesanan #1234</h3>
              <p className="text-sm text-gray-600">Lapangan: Lapangan A • 2025-12-03 • 10:00</p>
            </div>
            <div className="text-sm font-semibold text-green-600">Konfirmasi</div>
          </div>
        </div>

        <div className="p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Pesanan #1229</h3>
              <p className="text-sm text-gray-600">Lapangan: Lapangan B • 2025-11-28 • 18:00</p>
            </div>
            <div className="text-sm font-semibold text-yellow-600">Menunggu Pembayaran</div>
          </div>
        </div>
      </div>
    </section>
  );
}
