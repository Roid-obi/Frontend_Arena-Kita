import React from "react";

export default function OwnerDashboardHome() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Info Umum Owner</h1>
      <p className="text-gray-600 mb-4">Selamat datang di dashboard owner. Kelola profil dan lihat ringkasan aktivitas venue Anda.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Profil Owner</h3>
          <p className="text-sm text-gray-600">Informasi dasar owner dan kontak.</p>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Ringkasan Venue</h3>
          <p className="text-sm text-gray-600">Statistik singkat tentang venue Anda.</p>
        </div>
      </div>
    </section>
  );
}
