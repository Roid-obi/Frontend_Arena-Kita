"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Clock, DollarSign } from "lucide-react";
import Cookies from "js-cookie";

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

export default function FieldList({ fields, bookings, pricingSchemes = [] }: FieldListProps) {
  const [expandedFieldId, setExpandedFieldId] = useState<number | null>(null);
  const [selectedPricingScheme, setSelectedPricingScheme] = useState<{ [fieldId: number]: number | null }>({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ [fieldId: number]: string | null }>({});
  const [isBooking, setIsBooking] = useState(false);

  const getFieldPhotoUrl = (url: string) => {
      console.log(typeof url, url);
      if (!url || url.includes("placehold.co")) {
          return "https://placehold.co/2000x1200?text=Hello+World";
      }
      return `https://dev.api.arenakita.my.id/storage/${url}`;
  };

  const handePricingSchemeClick = (fieldId: number, schemeId: number) => {
      setSelectedPricingScheme((prev) => ({
          ...prev,
          [fieldId]: prev[fieldId] === schemeId ? null : schemeId,
      }));
  }

  const handleTimeSlotClick = (fieldId: number, time: string) => {
      setSelectedTimeSlot((prev) => ({
          ...prev,
          [fieldId]: prev[fieldId] === time ? null : time,
      }));
  }

    const calculateEndTime = (startTime: string, durationMinutes: number): string => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };


  const getAvailableTimeSlots = (fieldId: number): string[] => {
    const fieldBookings = bookings.filter((booking) => booking.pricing_scheme_id === fieldId && booking.booking_status === "CONFIRMED");

    // Generate time slots from 6:00 to 23:00 (1 hour per slot)
    const allSlots: string[] = [];
    for (let hour = 6; hour < 23; hour++) {
      allSlots.push(`${String(hour).padStart(2, "0")}:00`);
    }

    // Filter out booked times
    const bookedTimes = fieldBookings.map((b) => b.start_time.substring(0, 5));
    return allSlots.filter((slot) => !bookedTimes.includes(slot));
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

        if (!selectedSchemeId || !selectedTime) {
            alert("Silakan pilih paket harga dan jam booking terlebih dahulu!");
            return;
        }

        const selectedScheme = field.pricing_schemes.find(s => s.id === selectedSchemeId);
        if (!selectedScheme) return;

        setIsBooking(true);

        try {
            const token = Cookies.get("token");
            if (!token) {
                return;
            }

            const endTime = calculateEndTime(selectedTime, selectedScheme.duration_minutes);
            const bookingDate = new Date().toISOString().split('T')[0];

            const bookingData = {
                pricing_scheme_id: selectedSchemeId,
                booking_date: bookingDate,
                start_time: selectedTime,
                end_time: endTime,
                total_price: selectedScheme.raw_price.toFixed(2),
                booking_status: "PENDING"
            };

            const response = await fetch('https://dev.api.arenakita.my.id/api/v1/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(bookingData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal membuat booking');
            }

            alert(`Booking berhasil dibuat!\nLapangan: ${field.name}\nJam: ${selectedTime} - ${endTime}`);

            setSelectedPricingScheme(prev => ({ ...prev, [field.id]: null }));
            setSelectedTimeSlot(prev => ({ ...prev, [field.id]: null }));

            window.location.reload();

        } catch (error) {
            console.error('Booking error:', error);
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat booking');
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
                                            {getAvailableTimeSlots(field.id).length > 0 ? (
                                                getAvailableTimeSlots(field.id).map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => handleTimeSlotClick(field.id, time)}
                                                        className={`px-3 py-2 border font-semibold rounded-lg transition-colors text-xs md:text-sm shadow-sm ${
                                                            selectedTimeSlot[field.id] === time
                                                                ? "bg-[#f97316] border-[#f97316] text-white"
                                                                : "bg-white border-[#0d47a1]/30 text-[#0d47a1] hover:bg-[#0d47a1] hover:text-white"
                                                        }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 col-span-full">Tidak ada waktu yang tersedia untuk hari ini</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                          <button
                              onClick={() => handleBookNow(field)}
                              disabled={!selectedPricingScheme[field.id] || !selectedTimeSlot[field.id] || isBooking}
                              className="w-full px-4 py-2 md:py-3 bg-[#0d47a1] text-white font-semibold rounded-lg hover:bg-[#f97316] transition-colors text-sm md:text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {isBooking ? 'Memproses...' : 'Pesan Sekarang'}
                          </button>
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
