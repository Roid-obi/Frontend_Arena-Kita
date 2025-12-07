import React from "react";

export default function AdminUser() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Kelola User</h1>
      <p className="text-gray-600 mb-4">Daftar user, peran, dan opsi manajemen akun.</p>

      <div className="space-y-3">
        <div className="p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">User: Ani</h3>
              <p className="text-sm text-gray-600">Role: user • ani@example.com</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#0d47a1] text-white rounded">Detail</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded">Suspend</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
