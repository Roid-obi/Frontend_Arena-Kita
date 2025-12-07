import React from "react";

export default function AdminAccount() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pengaturan Admin</h1>
      <p className="text-gray-600 mb-4">Pengaturan akun admin, keamanan, dan preferensi sistem.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Profil Admin</h3>
          <p className="text-sm text-gray-600">Nama, email, dan informasi kontak.</p>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Keamanan</h3>
          <p className="text-sm text-gray-600">Ubah password dan autentikasi 2-faktor.</p>
        </div>
      </div>
    </section>
  );
}
