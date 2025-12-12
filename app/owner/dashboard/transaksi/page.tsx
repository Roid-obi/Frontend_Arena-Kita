"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface FieldInfo {
  field_name: string;
  sport_type: string;
  venue_name: string;
}

interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  raw_total_price: number;
  status: string;
  created_at: string;
  created_at_human: string;
  user: User;
  field_info: FieldInfo;
}

interface Transaction {
  id: number;
  payment_method: string;
  payment_status: string;
  payment_time: string;
  booking: Booking;
}

const TRANSACTIONS_URL = "https://dev.api.arenakita.my.id/api/v1/owners/transactions";

export default function OwnerTransaksi() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await fetch(TRANSACTIONS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success" && result.data) {
          setTransactions(result.data);
        } else {
          setError(result.message || "Gagal mengambil data transaksi");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Terjadi kesalahan saat mengambil data transaksi");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions berdasarkan search query
  const filteredTransactions = transactions.filter(
    (t) =>
      t.id.toString().includes(searchQuery) ||
      t.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.booking.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.booking.field_info.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.booking.field_info.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.booking.booking_date.includes(searchQuery)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

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
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Riwayat Transaksi</h1>
      <p className="text-gray-600 mb-4">Lihat semua transaksi pembayaran dari pesanan venue Anda.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode Pembayaran</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu Pembayaran</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{t.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.payment_method}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.payment_time}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{t.booking.user.name}</p>
                          <p className="text-xs text-gray-500">{t.booking.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.booking.field_info.venue_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">{t.booking.field_info.field_name}</p>
                          <p className="text-xs text-gray-500">{t.booking.field_info.sport_type}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.booking.booking_date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {t.booking.start_time} - {t.booking.end_time}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{t.booking.total_price}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(t.payment_status)}`}>{getPaymentStatusLabel(t.payment_status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && <div className="p-4 text-center text-gray-500">Tidak ada transaksi yang cocok dengan pencarian</div>}
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
