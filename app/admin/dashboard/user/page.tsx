"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import Cookies from "js-cookie";
import { API_BASE_URL, getStorageUrl } from "@/lib/api";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  profile_photo_url: string | null;
  email_verified_at: string | null;
  joined_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: User[];
}

export default function AdminUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = Cookies.get("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data user");
      }

      const result: ApiResponse = await response.json();

      if (result.status === "success" && result.data) {
        setUsers(result.data);
      } else {
        setError("Gagal memuat data user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Filter users berdasarkan search query
  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toString().includes(searchQuery) ||
      (u.phone_number && u.phone_number.includes(searchQuery))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset ke halaman 1 ketika search query berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Kelola User</h1>
      <p className="text-gray-600 mb-4">Daftar user penyewa dan informasi akun mereka.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari user..." />
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0d47a1]" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Telepon</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Terverifikasi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bergabung</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((u, index) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          {u.profile_photo_url ? (
                            <img src={getStorageUrl(u.profile_photo_url)} alt={u.full_name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#0d47a1] text-white flex items-center justify-center text-xs font-semibold">{u.full_name.charAt(0).toUpperCase()}</div>
                          )}
                          <span className="font-medium">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.phone_number || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        {u.email_verified_at ? (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">✓ Terverifikasi</span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">Belum</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.joined_at}</td>
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/dashboard/user/${u.id}`} className="bg-gray-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-600 transition">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="p-4 text-center text-gray-500">{searchQuery ? "Tidak ada user yang cocok dengan pencarian" : "Belum ada user"}</div>}
            </div>
            {filteredUsers.length > 0 && filteredUsers.length > itemsPerPage && (
              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
