"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, Clock, DollarSign } from "lucide-react";
import { API_BASE_URL, getApiUrl, getStorageUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Booking {
  id: number;
  user_id: number;
  pricing_scheme_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  booking_status: string;
  created_at: string;
  updated_at: string;
}

interface Field {
  id: number;
  name: string;
  type: string;
  status: string;
  photo_url: string;
  pricing_schemes: {
    id: number;
    duration_minutes: number;
    price: string;
    raw_price: number;
    description: string;
  }[];
}

interface PricingScheme {
  id: number;
  duration_minutes: number;
  price: string;
  raw_price: number;
  description: string;
}

interface FieldListProps {
  fields: Field[];
  bookings: Booking[];
  pricingSchemes?: PricingScheme[];
}

export default function FieldList({ fields, bookings: _bookings, pricingSchemes = [] }: FieldListProps) {
  const [expandedFieldId, setExpandedFieldId] = useState<number | null>(null);
  const [selectedPricingScheme, setSelectedPricingScheme] = useState<{ [fieldId: number]: number | null }>({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ [fieldId: number]: string | null }>({});
  const [selectedDate, setSelectedDate] = useState<{ [fieldId: number]: string | null }>({});
  const [isBooking, setIsBooking] = useState(false);
  const { user, token } = useAuth();

  const isLoggedIn = Boolean(user && token);
  const isUserRole = user?.role === "user";

  const [availabilityByField, setAvailabilityByField] = useState<
    Record<
      number,
      {
        bookedSlots: { start: string; end: string; status: string }[];
        open?: string;
        close?: string;
        loading: boolean;
        error?: string | null;
      }
    >
  >({});

  const todayDate = new Date().toISOString().split("T")[0];

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const isSlotBooked = (slotStart: string, durationMinutes: number, bookedSlots: { start: string; end: string }[]) => {
    const start = timeToMinutes(slotStart);
    const end = start + durationMinutes;
    return bookedSlots.some((b) => {
      const bookedStart = timeToMinutes(b.start);
      const bookedEnd = timeToMinutes(b.end);
      return start < bookedEnd && end > bookedStart;
    });
  };

  const buildSlots = (open?: string, close?: string) => {
    const openMinutes = open ? timeToMinutes(open) : 6 * 60;
    const closeMinutes = close ? timeToMinutes(close) : 23 * 60;
    const slots: string[] = [];
    for (let minutes = openMinutes; minutes < closeMinutes; minutes += 60) {
      const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
    return slots;
  };

  const fetchAvailability = async (fieldId: number, date: string) => {
    setAvailabilityByField((prev) => ({
      ...prev,
      [fieldId]: {
        bookedSlots: prev[fieldId]?.bookedSlots || [],
        open: prev[fieldId]?.open,
        close: prev[fieldId]?.close,
        error: null,
        loading: true,
      },
    }));

    try {
      const url = getApiUrl(`/fields/${fieldId}/availability?date=${date}`);
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || "Gagal mengambil ketersediaan jadwal");
      }

      const bookedSlots = json.data?.booked_slots || [];
      const open = json.data?.venue_operational?.open;
      const close = json.data?.venue_operational?.close;

      setAvailabilityByField((prev) => ({
        ...prev,
        [fieldId]: {
          bookedSlots,
          open,
          close,
          loading: false,
          error: null,
        },
      }));
    } catch (error) {
      setAvailabilityByField((prev) => ({
        ...prev,
        [fieldId]: {
          bookedSlots: prev[fieldId]?.bookedSlots || [],
          open: prev[fieldId]?.open,
          close: prev[fieldId]?.close,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal memuat jadwal",
        },
      }));
    }
  };

  useEffect(() => {
    if (expandedFieldId === null) return;
    const date = selectedDate[expandedFieldId] || todayDate;
    if (!selectedDate[expandedFieldId]) {
      setSelectedDate((prev) => ({ ...prev, [expandedFieldId]: date }));
    }
    fetchAvailability(expandedFieldId, date);
  }, [expandedFieldId]);

  const getFieldPhotoUrl = (url: string) => {
    console.log(typeof url, url);
    if (!url || url.includes("placehold.co")) {
      return "https://placehold.co/2000x1200?text=Hello+World";
    }
    return getStorageUrl(url);
  };

  const handePricingSchemeClick = (fieldId: number, schemeId: number) => {
    setSelectedPricingScheme((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId] === schemeId ? null : schemeId,
    }));
  };

  const handleTimeSlotClick = (fieldId: number, time: string) => {
    setSelectedTimeSlot((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId] === time ? null : time,
    }));
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  /*  const getFieldPricing = (fieldId: number) => {
    return pricingSchemes.filter((scheme) => scheme.field_id === fieldId);
  };*/

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    if (status === "AVAILABLE") {
      return <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Tersedia</span>;
    } else if (status === "MAINTENANCE") {
      return <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Perawatan</span>;
    }
    return null;
  };

  const handleBookNow = async (field: Field) => {
    const selectedSchemeId = selectedPricingScheme[field.id];
    const selectedTime = selectedTimeSlot[field.id];
    const bookingDateInput = selectedDate[field.id];

    if (!isLoggedIn) {
      alert("Harus login terlebih dahulu untuk melakukan pemesanan.");
      return;
    }

    if (!isUserRole) {
      alert("Hanya pengguna dengan role user yang dapat melakukan pemesanan.");
      return;
    }

    if (!selectedSchemeId || !selectedTime) {
      alert("Silakan pilih tanggal, paket harga, dan jam booking terlebih dahulu!");
      return;
    }

    const selectedScheme = field.pricing_schemes.find((s) => s.id === selectedSchemeId);
    if (!selectedScheme) return;

    setIsBooking(true);

    try {
      const endTime = calculateEndTime(selectedTime, selectedScheme.duration_minutes);
      const bookingDate = bookingDateInput || new Date().toISOString().split("T")[0];

      const bookingData = {
        pricing_scheme_id: selectedSchemeId,
        booking_date: bookingDate,
        start_time: selectedTime,
        end_time: endTime,
        total_price: selectedScheme.raw_price.toFixed(2),
        booking_status: "PENDING",
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat booking");
      }

      alert(`Booking berhasil dibuat!\nLapangan: ${field.name}\nJam: ${selectedTime} - ${endTime}`);

      setSelectedPricingScheme((prev) => ({ ...prev, [field.id]: null }));
      setSelectedTimeSlot((prev) => ({ ...prev, [field.id]: null }));
      setSelectedDate((prev) => ({ ...prev, [field.id]: null }));

      window.location.reload();
    } catch (error) {
      console.error("Booking error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat membuat booking");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">Daftar Lapangan</h3>

      {fields && fields.length > 0 ? (
        <div className="grid gap-4 md:gap-6">
          {fields.map((field) => {
            const pricing = field.pricing_schemes || [];
            const minPrice = pricing.length > 0 ? Math.min(...pricing.map((p: PricingScheme) => p.raw_price)) : 0;

            return (
              <div key={field.id} className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white">
                {/* Field Card Header with Image on Left */}
                <div className="flex flex-col md:flex-row">
                  {/* Field Image */}
                  <div className="relative w-full md:w-48 h-40 md:h-auto bg-gray-100 shrink-0">
                    <Image src={getFieldPhotoUrl(field.photo_url)} alt={field.name} fill className="object-cover" />
                  </div>

                  {/* Field Info */}
                  <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <h4 className="text-base md:text-lg font-bold text-[#1a1a1a]">{field.name}</h4>
                        {getStatusBadge(field.status)}
                      </div>
                      <p className="text-sm md:text-base text-gray-600 mb-3">Tipe: {field.type}</p>

                      {/* Pricing Info */}
                      {pricing.length > 0 && (
                        <div className="flex items-center gap-2 text-[#0d47a1] font-semibold mb-4 text-sm md:text-base">
                          <DollarSign size={18} className="md:w-5 md:h-5" />
                          <span>Mulai dari {formatPrice(minPrice)}</span>
                        </div>
                      )}
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
                      className="self-start flex items-center gap-2 px-4 py-2 bg-[#0d47a1] text-white font-semibold rounded-lg hover:bg-[#f97316] transition-colors text-sm md:text-base"
                    >
                      <span>{expandedFieldId === field.id ? "Sembunyikan" : "Lihat"} Jam Booking</span>
                      <ChevronDown size={18} className={`transition-transform md:w-5 md:h-5 ${expandedFieldId === field.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Expandable Booking Section */}
                {expandedFieldId === field.id && (
                  <div className="border-t border-gray-200 p-4 md:p-5 bg-gray-50">
                    {field.status === "AVAILABLE" ? (
                      <div>
                        {/* Booking Date Picker */}
                        <div className="mb-4">
                          <label className="block text-sm md:text-base font-semibold text-[#1a1a1a] mb-2">Pilih Tanggal Booking:</label>
                          <input
                            type="date"
                            value={selectedDate[field.id] || ""}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                              const nextDate = e.target.value;
                              setSelectedDate((prev) => ({ ...prev, [field.id]: nextDate }));
                              if (nextDate) {
                                fetchAvailability(field.id, nextDate);
                                setSelectedTimeSlot((prev) => ({ ...prev, [field.id]: null }));
                              }
                            }}
                            className="px-3 py-2 border rounded-lg text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d47a1] focus:border-[#0d47a1]"
                          />
                        </div>
                        {/* Pricing Breakdown */}
                        {pricing.length > 0 && (
                          <div className="mb-4">
                            <p className="font-semibold text-[#1a1a1a] mb-3 text-sm md:text-base">Pilih Paket Harga:</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {pricing.map((scheme) => (
                                <button
                                  key={scheme.id}
                                  onClick={() => handePricingSchemeClick(field.id, scheme.id)}
                                  className={`px-4 py-2 border rounded-lg text-sm md:text-base font-semibold shadow-sm transition-colors ${
                                    selectedPricingScheme[field.id] === scheme.id
                                      ? "bg-[#f97316] border-[#f97316] text-white"
                                      : "bg-white border-[#0d47a1]/30 text-[#0d47a1] hover:bg-[#0d47a1] hover:text-white"
                                  }`}
                                >
                                  {scheme.description} - {formatPrice(scheme.raw_price)}
                                </button>
                              ))}
                            </div>

                            {/*Show time slots*/}
                            {selectedPricingScheme[field.id] && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock size={18} className="text-[#0d47a1] md:w-5 md:h-5" />
                                  <h5 className="font-semibold text-[#1a1a1a] text-sm md:text-base">Pilih Jam Booking:</h5>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
                                  {(() => {
                                    const info = availabilityByField[field.id];
                                    const bookedSlots = info?.bookedSlots || [];
                                    const slots = buildSlots(info?.open, info?.close);
                                    const selectedSchemeIdForField = selectedPricingScheme[field.id];
                                    const selectedSchemeForField = pricing.find((s) => s.id === selectedSchemeIdForField);
                                    const duration = selectedSchemeForField?.duration_minutes || 60;

                                    if (info?.loading) {
                                      return <p className="text-sm text-gray-500 col-span-full">Memuat ketersediaan jadwal...</p>;
                                    }

                                    if (info?.error) {
                                      return <p className="text-sm text-red-600 col-span-full">{info.error}</p>;
                                    }

                                    if (slots.length === 0) {
                                      return <p className="text-sm text-gray-500 col-span-full">Tidak ada waktu yang tersedia untuk hari ini</p>;
                                    }

                                    return slots.map((time) => {
                                      const disabled = isSlotBooked(time, duration, bookedSlots);
                                      return (
                                        <button
                                          key={time}
                                          onClick={() => handleTimeSlotClick(field.id, time)}
                                          disabled={disabled}
                                          className={`px-3 py-2 border font-semibold rounded-lg transition-colors text-xs md:text-sm shadow-sm ${
                                            disabled
                                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                              : selectedTimeSlot[field.id] === time
                                              ? "bg-[#f97316] border-[#f97316] text-white"
                                              : "bg-white border-[#0d47a1]/30 text-[#0d47a1] hover:bg-[#0d47a1] hover:text-white"
                                          }`}
                                        >
                                          {time}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => handleBookNow(field)}
                          disabled={!isLoggedIn || !isUserRole || !selectedPricingScheme[field.id] || !selectedTimeSlot[field.id] || isBooking}
                          className="w-full px-4 py-2 md:py-3 bg-[#0d47a1] text-white font-semibold rounded-lg hover:bg-[#f97316] transition-colors text-sm md:text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBooking ? "Memproses..." : "Pesan Sekarang"}
                        </button>
                        {!isLoggedIn && <p className="mt-2 text-sm text-red-600">Anda harus login sebagai user untuk memesan.</p>}
                        {isLoggedIn && !isUserRole && <p className="mt-2 text-sm text-red-600">Hanya akun dengan role user yang dapat memesan.</p>}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 md:p-4 rounded-lg">
                        <p className="text-yellow-800 font-semibold text-sm md:text-base">Lapangan sedang dalam perawatan</p>
                        <p className="text-sm text-yellow-700 mt-1">Pemesanan untuk lapangan ini tidak tersedia saat ini.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 text-base">Tidak ada lapangan yang tersedia</p>
        </div>
      )}
    </div>
  );
}
