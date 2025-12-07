"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Clock, DollarSign } from "lucide-react";

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
  venue_id: number;
  field_name: string;
  sport_type: string;
  field_photo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}

interface PricingScheme {
  id: number;
  field_id: number;
  duration_minutes: number;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}

interface FieldListProps {
  fields: Field[];
  bookings: Booking[];
  pricingSchemes?: PricingScheme[];
}

export default function FieldList({ fields, bookings, pricingSchemes = [] }: FieldListProps) {
  const [expandedFieldId, setExpandedFieldId] = useState<number | null>(null);

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

  const getFieldPricing = (fieldId: number) => {
    return pricingSchemes.filter((scheme) => scheme.field_id === fieldId);
  };

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

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Daftar Lapangan</h3>

      {fields && fields.length > 0 ? (
        <div className="grid gap-4">
          {fields.map((field) => {
            const pricing = getFieldPricing(field.id);
            const minPrice = pricing.length > 0 ? Math.min(...pricing.map((p) => p.price)) : 0;

            return (
              <div key={field.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                {/* Field Card Header with Image on Left */}
                <div className="flex flex-col md:flex-row">
                  {/* Field Image */}
                  <div className="relative w-full md:w-48 h-40 md:h-auto bg-gray-100 flex-shrink-0">
                    <Image src={field.field_photo_url} alt={field.field_name} fill className="object-cover" />
                  </div>

                  {/* Field Info */}
                  <div className="flex-1 p-3 sm:p-4 md:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">{field.field_name}</h4>
                        {getStatusBadge(field.status)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">Tipe: {field.sport_type}</p>

                      {/* Pricing Info */}
                      {pricing.length > 0 && (
                        <div className="flex items-center gap-1 sm:gap-2 text-blue-600 font-semibold mb-4 text-sm sm:text-base">
                          <DollarSign size={16} className="sm:w-5 sm:h-5" />
                          <span>Mulai dari {formatPrice(minPrice)}</span>
                        </div>
                      )}
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
                      className="self-start flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors text-sm sm:text-base"
                    >
                      <span>{expandedFieldId === field.id ? "Sembunyikan" : "Lihat"} Jam Booking</span>
                      <ChevronDown size={18} className={`transition-transform w-4 h-4 sm:w-5 sm:h-5 ${expandedFieldId === field.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Expandable Booking Section */}
                {expandedFieldId === field.id && (
                  <div className="border-t border-gray-200 p-3 sm:p-4 md:p-5 bg-gray-50">
                    {field.status === "AVAILABLE" ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <Clock size={18} className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                          <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Jam Booking Tersedia</h5>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2 mb-4">
                          {getAvailableTimeSlots(field.id).length > 0 ? (
                            getAvailableTimeSlots(field.id).map((time) => (
                              <button
                                key={time}
                                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-blue-300 text-blue-700 font-semibold rounded hover:bg-blue-50 transition-colors text-xs sm:text-sm shadow-sm"
                              >
                                {time}
                              </button>
                            ))
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500 col-span-full">Tidak ada waktu yang tersedia untuk hari ini</p>
                          )}
                        </div>

                        {/* Pricing Breakdown */}
                        {pricing.length > 0 && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">Paket Harga:</p>
                            <div className="space-y-1.5 sm:space-y-2">
                              {pricing.map((scheme) => (
                                <div key={scheme.id} className="flex justify-between text-xs sm:text-sm">
                                  <span className="text-gray-700">
                                    {scheme.description} ({scheme.duration_minutes} menit)
                                  </span>
                                  <span className="font-semibold text-blue-600">{formatPrice(scheme.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button className="w-full px-4 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">Pesan Sekarang</button>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 sm:p-4 rounded-lg">
                        <p className="text-yellow-800 font-semibold text-sm sm:text-base">Lapangan sedang dalam perawatan</p>
                        <p className="text-xs sm:text-sm text-yellow-700 mt-1">Pemesanan untuk lapangan ini tidak tersedia saat ini.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Tidak ada lapangan yang tersedia</p>
        </div>
      )}
    </div>
  );
}
