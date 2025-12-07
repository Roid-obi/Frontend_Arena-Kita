import React from "react";

export default function DashboardAccount() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pengaturan Akun</h1>
      <p className="text-gray-600 mb-4">Perbarui informasi akun, ubah kata sandi, dan atur preferensi notifikasi.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Ubah Profil</h3>
          <p className="text-sm text-gray-600">Form edit profil (nama, telepon, dsb.)</p>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Keamanan</h3>
          <p className="text-sm text-gray-600">Ubah kata sandi dan konfigurasi keamanan lainnya.</p>
        </div>
      </div>
    </section>
  );
}
