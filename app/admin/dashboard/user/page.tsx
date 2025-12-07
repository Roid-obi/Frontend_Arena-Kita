"use client";

import React, { useState } from "react";
import SearchBar from "@/components/SearchBar";
import usersData from "@/data/dummy/users.json";

export default function AdminUser() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users berdasarkan search query
  const filteredUsers = usersData.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toString().includes(searchQuery)
  );

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Kelola User</h1>
      <p className="text-gray-600 mb-4">Daftar user, peran, dan opsi manajemen akun.</p>

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari user..." />
      </div>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{u.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{u.full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {u.role || "user"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="px-3 py-1 bg-[#0d47a1] text-white rounded text-sm">Detail</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-4 text-center text-gray-500">Tidak ada user yang cocok dengan pencarian</div>
        )}
      </div>
    </section>
  );
}
