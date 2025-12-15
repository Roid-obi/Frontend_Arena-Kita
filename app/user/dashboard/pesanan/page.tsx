"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import Cookies from "js-cookie";

interface UserBooking {
  id: number;
  pricing_scheme_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  booking_status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: UserBooking[];
}

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
}

interface TransactionResponse {
  status: string;
  message: string;
  data: {
    transaction: {
      booking_id: number;
      payment_method: string;
      payment_status: string;
    };
    amount: string;
    qr_image_url: string;
  };
}

export default function DashboardPesanan() {
  const router = useRouter();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED">("PENDING");
  const [statusCounts, setStatusCounts] = useState<{ PENDING: number; CONFIRMED: number; REJECTED: number; COMPLETED: number }>(
    {
      PENDING: 0,
      CONFIRMED: 0,
      REJECTED: 0,
      COMPLETED: 0,
    }
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [qrisUrl, setQrisUrl] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const itemsPerPage = 5;

  const paymentMethods: PaymentMethod[] = [
    { id: "GoPay", name: "GoPay", logo: "💳" },
    { id: "OVO", name: "OVO", logo: "💰" },
    { id: "Dana", name: "Dana", logo: "💵" },
  ];

  const fetchStatusCounts = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await fetch("https://dev.api.arenakita.my.id/api/v1/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const result: ApiResponse = await response.json();

      if (result.status === "success" && result.data) {
        const counts = {
          PENDING: result.data.filter((b) => b.booking_status.toUpperCase() === "PENDING").length,
          CONFIRMED: result.data.filter((b) => b.booking_status.toUpperCase() === "CONFIRMED").length,
          REJECTED: result.data.filter((b) => b.booking_status.toUpperCase() === "REJECTED").length,
          COMPLETED: result.data.filter((b) => b.booking_status.toUpperCase() === "COMPLETED").length,
        };
        setStatusCounts(counts);
      }
    } catch (err) {
      console.error("Error fetching status counts:", err);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        if (!token) {
          return;
        }

        const response = await fetch("https://dev.api.arenakita.my.id/api/v1/bookings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data pesanan: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.status === "success" && result.data) {
          setBookings(result.data);
        } else {
          setError(result.message || "Terjadi kesalahan");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Terjadi kesalahan saat mengambil data pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    fetchStatusCounts();
  }, [bookings]);

  const handlePayment = (booking: UserBooking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
    setSelectedPayment("");
    setError("");
  };

  const handleConfirmPayment = async () => {
    if (!selectedBooking || !selectedPayment) {
      return;
    }

    try {
      setProcessingPayment(true);
      const token = Cookies.get("token");

      const response = await fetch("https://dev.api.arenakita.my.id/api/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          payment_method: selectedPayment,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat transaksi");
      }

      const result: TransactionResponse = await response.json();

      if (result.status === "success" && result.data.qr_image_url) {
        setQrisUrl(result.data.qr_image_url);
        setShowPaymentModal(false);
        setShowQrisModal(true);
      } else {
        setError(result.message || "Gagal mendapatkan QRIS");
      }
    } catch (err) {
      console.error("Error creating transaction:", err);
      setError("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setProcessingPayment(false);
    }
  };

  const closeModals = () => {
    setShowPaymentModal(false);
    setShowQrisModal(false);
    setSelectedBooking(null);
    setSelectedPayment("");
    setQrisUrl("");
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (showQrisModal && selectedBooking) {
      intervalId = setInterval(async () => {
        try {
          const token = Cookies.get("token");
          const response = await fetch(`https://dev.api.arenakita.my.id/api/v1/bookings/${selectedBooking.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            const paymentStatus = result.data?.payment?.payment_status;

            if (paymentStatus === "SUCCESS") {
              clearInterval(intervalId);
              router.push(`/user/dashboard/pesanan/${selectedBooking.id}`);
            }
          }
        } catch (error) {
          console.error("Error checking payment status", error);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showQrisModal, selectedBooking, router]);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.id.toString().includes(searchQuery) || b.booking_date.includes(searchQuery) || b.booking_status.toLowerCase().includes(searchQuery.toLowerCase());

    const statusUpper = b.booking_status.toUpperCase();
    const matchesTab =
      (activeTab === "PENDING" && statusUpper === "PENDING") ||
      (activeTab === "CONFIRMED" && statusUpper === "CONFIRMED") ||
      (activeTab === "REJECTED" && statusUpper === "REJECTED") ||
      (activeTab === "COMPLETED" && statusUpper === "COMPLETED");

    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "bg-yellow-100 text-yellow-800";
    if (statusUpper === "CONFIRMED") return "bg-green-100 text-green-800";
    if (statusUpper === "COMPLETED") return "bg-emerald-100 text-emerald-800";
    if (statusUpper === "REJECTED") return "bg-red-100 text-red-800";
    if (statusUpper === "FAILED") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PENDING") return "Menunggu";
    if (statusUpper === "CONFIRMED") return "Berhasil";
    if (statusUpper === "COMPLETED") return "Selesai";
    if (statusUpper === "REJECTED") return "Ditolak";
    if (statusUpper === "FAILED") return "Gagal";
    return status;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pesanan Saya</h1>
      <p className="text-gray-600 mb-4">Status pesanan dan riwayat pemesanan Anda.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      <div className="mb-4 w-full md:w-64">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Cari pesanan..." />
      </div>

      {/* Tab Filter */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200">
        {[
          { key: "PENDING", label: "Menunggu" },
          { key: "CONFIRMED", label: "Berhasil" },
          { key: "REJECTED", label: "Ditolak" },
          { key: "COMPLETED", label: "Selesai" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key ? "border-[#0d47a1] text-[#0d47a1]" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {tab.label} <span className="ml-2 inline-block bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">{statusCounts[tab.key as keyof typeof statusCounts]}</span>
          </button>
        ))}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBookings.map((b, index) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.booking_date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {b.start_time} - {b.end_time}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{b.total_price}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(b.booking_status)}`}>{getStatusLabel(b.booking_status)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{b.created_at}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link href={`/user/dashboard/pesanan/${b.id}`} className="bg-gray-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-600 transition">
                            Detail
                          </Link>
                          {b.booking_status.toUpperCase() === "PENDING" && (
                            <button onClick={() => handlePayment(b)} className="bg-[#0d47a1] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[#0a3d8f] transition">
                              Bayar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && <div className="p-4 text-center text-gray-500">{searchQuery ? "Tidak ada pesanan yang cocok dengan pencarian" : "Belum ada pesanan"}</div>}
            </div>
            {filteredBookings.length > 0 && filteredBookings.length > itemsPerPage && (
              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-[#0d47a1] mb-4">Pilih Metode Pembayaran</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Total Pembayaran:</p>
              <p className="text-2xl font-bold text-gray-800">{selectedBooking.total_price}</p>
            </div>
            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`border rounded-lg p-3 cursor-pointer transition ${selectedPayment === method.id ? "border-[#0d47a1] bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{method.logo}</span>
                    <span className="font-medium text-gray-700">{method.name}</span>
                    {selectedPayment === method.id && <span className="ml-auto text-[#0d47a1]">✓</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={closeModals} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
                Batal
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={!selectedPayment || processingPayment}
                className="flex-1 bg-[#0d47a1] text-white px-4 py-2 rounded hover:bg-[#0a3d8f] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processingPayment ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS Modal */}
      {showQrisModal && qrisUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-[#0d47a1] mb-4">Scan QRIS untuk Membayar</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Total Pembayaran:</p>
              <p className="text-2xl font-bold text-gray-800">{selectedBooking?.total_price}</p>
            </div>
            <div className="flex justify-center mb-4 bg-gray-100 p-4 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrisUrl} alt="QRIS Code" className="max-w-full h-auto" />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">Scan kode QR di atas menggunakan aplikasi {selectedPayment}</p>
            <button onClick={closeModals} className="w-full bg-[#0d47a1] text-white px-4 py-2 rounded hover:bg-[#0a3d8f] transition">
              Tutup
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
