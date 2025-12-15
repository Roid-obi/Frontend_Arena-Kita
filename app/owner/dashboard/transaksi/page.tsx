"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { X } from "lucide-react";

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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
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

  const getBookingStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "bg-yellow-100 text-yellow-800";
    if (statusUpper === "CONFIRMED") return "bg-green-100 text-green-800";
    if (statusUpper === "COMPLETED") return "bg-emerald-100 text-emerald-800";
    if (statusUpper === "REJECTED" || statusUpper === "CANCELLED") return "bg-red-100 text-red-800";
    if (statusUpper === "FAILED") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getBookingStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "Menunggu";
    if (statusUpper === "CONFIRMED") return "Disetujui";
    if (statusUpper === "COMPLETED") return "Selesai";
    if (statusUpper === "REJECTED") return "Ditolak";
    if (statusUpper === "CANCELLED") return "Dibatalkan";
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode Pembayaran</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu Pembayaran</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.map((t, index) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{startIndex + index + 1}</td>
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
                      <td className="px-4 py-3 text-sm">
                        <button onClick={() => setSelectedTransaction(t)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          Detail
                        </button>
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

      {/* Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTransaction(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0d47a1]">Detail Transaksi</h2>
              <button onClick={() => setSelectedTransaction(null)} className="p-1 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Transaksi</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID Transaksi:</span>
                    <span className="text-sm font-semibold text-gray-900">#{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Metode Pembayaran:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Waktu Pembayaran:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.payment_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status Pembayaran:</span>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(selectedTransaction.payment_status)}`}>
                      {getPaymentStatusLabel(selectedTransaction.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Booking</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID Booking:</span>
                    <span className="text-sm font-semibold text-gray-900">#{selectedTransaction.booking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status Booking:</span>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getBookingStatusColor(selectedTransaction.booking.status)}`}>
                      {getBookingStatusLabel(selectedTransaction.booking.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tanggal Booking:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.booking.booking_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Jam Booking:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedTransaction.booking.start_time} - {selectedTransaction.booking.end_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Harga:</span>
                    <span className="text-sm font-bold text-[#0d47a1]">{selectedTransaction.booking.total_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dibuat:</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.booking.created_at_human}</span>
                  </div>
                </div>
              </div>

              {/* Venue & Field Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Venue & Lapangan</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Venue:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.booking.field_info.venue_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lapangan:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.booking.field_info.field_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipe Olahraga:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.booking.field_info.sport_type}</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pemesan</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nama:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTransaction.booking.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.booking.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Telepon:</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.booking.user.phone || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button onClick={() => setSelectedTransaction(null)} className="w-full px-4 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
