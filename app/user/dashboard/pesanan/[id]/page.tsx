"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

interface BookingDetail {
    booking: {
        booking_date: string;
        start_time: string;
        end_time: string;
        total_price: string;
        booking_status: string | null;
    };
    venue: {
        venue_name: string;
        address: string;
    };
    field: {
        field_name: string;
        sport_type: string;
    };
    scheme: {
        duration: number;
        price: string;
    };
    payment: {
        payment_status: string;
        qr_url?: string | null;
    } | null;
}

interface ApiResponse {
    status: string;
    message: string;
    data: BookingDetail;
}

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookingDetail = async () => {
            try {
                setLoading(true);
                const token = Cookies.get("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(`https://dev.api.arenakita.my.id/api/v1/bookings/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Gagal mengambil detail pesanan: ${response.status}`);
                }

                const result: ApiResponse = await response.json();

                if (result.status === "success" && result.data) {
                    setBookingDetail(result.data);
                } else {
                    setError(result.message || "Terjadi kesalahan");
                }
            } catch (err) {
                console.error("Error fetching booking detail:", err);
                setError("Terjadi kesalahan saat mengambil detail pesanan");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBookingDetail();
        }
    }, [id, router]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (bookingDetail?.payment?.payment_status === 'PENDING' && id) {
            intervalId = setInterval(async () => {
                try {
                    const token = Cookies.get("token");
                    const response = await fetch(`https://dev.api.arenakita.my.id/api/v1/bookings/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        const result: ApiResponse = await response.json();
                        if (result.status === "success" && result.data) {
                            // Only update if status changed
                            if (result.data.payment?.payment_status !== bookingDetail.payment?.payment_status) {
                                setBookingDetail(result.data);
                            }
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
    }, [bookingDetail, id]);

    const getStatusColor = (status: string | null) => {
        if (!status) return "bg-gray-100 text-gray-800";
        const statusUpper = status.toUpperCase();
        if (statusUpper.includes("WAITING")) return "bg-blue-100 text-blue-800";
        if (statusUpper.includes("PENDING")) return "bg-yellow-100 text-yellow-800";
        if (statusUpper.includes("CONFIRMED")) return "bg-green-100 text-green-800";
        if (statusUpper.includes("FAILED")) return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    const getStatusLabel = (status: string | null) => {
        if (!status) return "N/A";
        const statusUpper = status.toUpperCase();
        if (statusUpper.includes("PENDING")) return "Menunggu Pembayaran";
        if (statusUpper.includes("KONFIRMASI")) return "Menunggu Konfirmasi";
        if (statusUpper.includes("TERKONFIRMASI")) return "Terkonfirmasi";
        if (statusUpper.includes("CONFIRMED")) return "Sukses";
        if (statusUpper.includes("FAILED")) return "Pesanan Gagal";
        return status;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 min-h-screen">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0d47a1]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
                <Link href="/user/dashboard/pesanan" className="text-[#0d47a1] hover:underline">
                    &larr; Kembali ke Daftar Pesanan
                </Link>
            </div>
        );
    }

    if (!bookingDetail) {
        return null;
    }

    const { booking, venue, field, scheme, payment } = bookingDetail;

    return (
        <section className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <Link href="/user/dashboard/pesanan" className="text-[#0d47a1] hover:underline flex items-center gap-2">
                    <span>&larr;</span> Kembali
                </Link>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-6">Detail Pesanan</h1>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Venue</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nama Venue</p>
                            <p className="font-medium text-gray-800">{venue.venue_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Alamat</p>
                            <p className="font-medium text-gray-800">{venue.address}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Lapangan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nama Lapangan</p>
                            <p className="font-medium text-gray-800">{field.field_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Jenis Olahraga</p>
                            <p className="font-medium text-gray-800">{field.sport_type}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Booking</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Tanggal</p>
                            <p className="font-medium text-gray-800">{booking.booking_date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Waktu</p>
                            <p className="font-medium text-gray-800">{booking.start_time} - {booking.end_time}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Durasi</p>
                            <p className="font-medium text-gray-800">{scheme.duration} Menit</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status Booking</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.booking_status)}`}>
                                {getStatusLabel(booking.booking_status)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pembayaran</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Total Harga</p>
                            <p className="text-xl font-bold text-[#0d47a1]">{booking.total_price}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status Pembayaran</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                payment?.payment_status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                payment?.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {payment?.payment_status || 'Belum Dibayar'}
                            </span>
                        </div>
                    </div>
                    {payment?.payment_status === 'PENDING' && payment?.qr_url && (
                        <div className="mt-6 flex flex-col items-center">
                            <p className="text-sm text-gray-600 mb-2">Scan QRIS untuk Membayar</p>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <img src={payment.qr_url} alt="QRIS Code" className="max-w-[200px] h-auto" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
