import React from "react";

export default function OwnerPesanan() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Masuk</h1>
      <p className="text-gray-600 mb-4">Lihat pesanan yang masuk untuk semua venue Anda.</p>

      <div className="space-y-4">
        <div className="p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Pesanan #5678</h3>
              <p className="text-sm text-gray-600">Venue: Stadium A • 2025-12-05 • 15:00</p>
            </div>
            <div className="text-sm font-semibold text-green-600">Dikonfirmasi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
