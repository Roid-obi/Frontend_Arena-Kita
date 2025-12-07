import React from "react";

export default function DashboardHome() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Info Umum</h1>
      <p className="text-gray-600 mb-4">Selamat datang di dashboard pengguna. Di sini kamu dapat melihat informasi dasar akunmu.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Profil</h3>
          <p className="text-sm text-gray-600">Nama, email, dan informasi dasar lainnya akan ditampilkan di sini.</p>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Ringkasan Pesanan</h3>
          <p className="text-sm text-gray-600">Lihat ringkasan pesanan terbaru dan statusnya.</p>
        </div>
      </div>
    </section>
  );
}
