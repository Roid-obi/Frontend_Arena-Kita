"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api";

interface Transaction {
  id: number;
  code: string;
  payment_status: string;
  total_price: string;
  raw_total_price: number;
  payment_method: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  destination: {
    venue_name: string;
    owner_name: string;
    field_name: string;
  };
  booking_detail: {
    date: string;
    time: string;
  };
}

interface ApiResponse {
  status: string;
  message: string;
  data: Transaction[];
}

export default function AdminTransaksi() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const token = Cookies.get("token");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/transactions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data transaksi");
      }

      const result: ApiResponse = await response.json();

      if (result.status === "success" && result.data) {
        setTransactions(result.data);
      } else {
        setError("Gagal memuat data transaksi");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions berdasarkan search query
  const filteredTransactions = transactions.filter(
    (t) =>
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.payment_method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Calculate total revenue
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.raw_total_price, 0);

  // Reset ke halaman 1 ketika search query berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getPaymentStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "SUCCESS") return "bg-green-100 text-green-800";
    if (statusUpper === "PENDING") return "bg-yellow-100 text-yellow-800";
    if (statusUpper === "FAILED") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "SUCCESS") return "Berhasil";
    if (statusUpper === "PENDING") return "Menunggu";
    if (statusUpper === "FAILED") return "Gagal";
    return status;
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Transaksi Global</h1>
      <p className="text-gray-600 mb-4">Laporan transaksi dan pembayaran dari semua pengguna.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
          <p className="text-2xl font-bold text-[#0d47a1]">{filteredTransactions.length}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
          <p className="text-2xl font-bold text-green-600">Rp {totalRevenue.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Transaksi Berhasil</p>
          <p className="text-2xl font-bold text-green-600">{filteredTransactions.filter((t) => t.payment_status.toUpperCase() === "SUCCESS").length}</p>
        </div>
      </div>

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari transaksi..." />
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Transaksi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.map((t, index) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{t.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{t.user.name}</p>
                          <p className="text-xs text-gray-500">{t.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{t.destination.venue_name}</p>
                          <p className="text-xs text-gray-500">{t.destination.field_name}</p>
                          <p className="text-xs text-gray-400">Owner: {t.destination.owner_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{t.booking_detail.date}</p>
                          <p className="text-xs text-gray-500">{t.booking_detail.time}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700">{t.payment_method}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{t.total_price}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(t.payment_status)}`}>{getPaymentStatusLabel(t.payment_status)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && <div className="p-4 text-center text-gray-500">{searchQuery ? "Tidak ada transaksi yang cocok dengan pencarian" : "Belum ada transaksi"}</div>}
            </div>
            {filteredTransactions.length > 0 && filteredTransactions.length > itemsPerPage && (
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
