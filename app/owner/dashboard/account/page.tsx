import React from "react";

export default function OwnerAccount() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pengaturan Owner</h1>
      <p className="text-gray-600 mb-4">Perbarui informasi akun owner, metode pembayaran, dan keamanan.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Informasi Bisnis</h3>
          <p className="text-sm text-gray-600">Nama bisnis, alamat, kontak.</p>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Keamanan & Akun</h3>
          <p className="text-sm text-gray-600">Ubah password dan setelan keamanan.</p>
        </div>
      </div>
    </section>
  );
}
