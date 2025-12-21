"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import Cookies from "js-cookie";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { API_BASE_URL } from "@/lib/api";
import { Trash2 } from "lucide-react";

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface Owner {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  bank_details: BankDetails;
  total_venues: number;
  created_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: Owner[];
}

export default function AdminOwnerPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        setError("");

        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/admin/owners`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Gagal mengambil data owner");
        }

        const json: ApiResponse = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setOwners(json.data);
        } else {
          throw new Error(json.message || "Gagal memuat data owner");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const filteredOwners = owners.filter((o) => {
    const query = searchQuery.toLowerCase();
    return (
      o.full_name.toLowerCase().includes(query) ||
      o.email.toLowerCase().includes(query) ||
      (o.phone_number || "").toLowerCase().includes(query) ||
      o.bank_details.bank_name.toLowerCase().includes(query) ||
      o.bank_details.account_number.toLowerCase().includes(query) ||
      o.bank_details.account_name.toLowerCase().includes(query) ||
      o.id.toString().includes(searchQuery)
    );
  });

  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOwners = filteredOwners.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus owner ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      setDeletingId(id);
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/admin/owners/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json && json.status === "success") {
        setOwners((prev) => prev.filter((o) => o.id !== id));
      } else {
        alert((json && json.message) || `Gagal menghapus (${res.status})`);
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-1">Kelola Owner</h1>
      <p className="text-gray-600 mb-4">Pantau data pemilik lapangan dan detail rekening mereka.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 sm:mb-6">
        <div className="w-full md:w-64">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari owner, email, atau bank..." />
        </div>
        <Link href="/admin/dashboard/owner/new" className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] text-sm">
          <Plus size={16} />
          <span>Tambah Owner</span>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terdaftar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOwners.map((o, index) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{o.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.phone_number || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{o.bank_details.bank_name}</span>
                          <span className="text-xs text-gray-600">{o.bank_details.account_number}</span>
                          <span className="text-xs text-gray-600">a.n {o.bank_details.account_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.total_venues}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.created_at}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <Link href={`/admin/dashboard/owner/${o.id}`} className="text-[#0d47a1] font-medium hover:underline">
                            Detail
                          </Link>
                          <button
                            onClick={() => handleDelete(o.id)}
                            disabled={deletingId === o.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Hapus</span>
                            <span className="sm:hidden">×</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOwners.length === 0 && <div className="p-4 text-center text-gray-500">{searchQuery ? "Tidak ada owner yang cocok dengan pencarian" : "Belum ada data owner"}</div>}
            </div>
            {filteredOwners.length > itemsPerPage && (
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
