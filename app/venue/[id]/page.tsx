"use client";

import React, { useState, useEffect } from "react";
import { use } from "react";
import { Clock, MapPin, Building2, ExternalLink, ArrowLeft } from "lucide-react";
import PhotoCarousel from "@/components/PhotoCarousel";
import FieldList from "@/components/FieldList";
import bookingsData from "@/data/dummy/bookings.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface VenuaData {
  id: number;
  venue_name: string;
  description: string;
  address: string;
  city: string;
  gps_coordinate: string;
  opening_time: string;
  closing_time: string;
  thumbnail: string;
  photos: Array<{
    id: number;
    url: string;
  }>;
  fields: Array<{
    id: number;
    name: string;
    type: string;
    status: string;
    photo_url: string;
    pricing_schemes: Array<{
      id: number;
      duration_minutes: number;
      price: string;
      raw_price: number;
      description: string;
    }>;
  }>;
}

export default function VenueDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [venue, setVenue] = useState<VenuaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://dev.api.arenakita.my.id/api/v1/venues/${id}`);
        const result = await response.json();

        if (result.status === "success" && result.data) {
          setVenue(result.data);
        }
      } catch (error) {
        console.log("Error fetching detail venue: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Venue Tidak Ditemukan</h1>
          <p className="text-gray-600">Venue dengan ID {id} tidak tersedia.</p>
        </div>
      </div>
    );
  }

  // Get related photos
  const photos = venue.photos || [];

  // Get related fields
  const fields = venue.fields || [];

  // Parse GPS coordinate
  let latitude = 0;
  let longitude = 0;
  let hasValidCoordinates = false;

  if (venue.gps_coordinate && venue.gps_coordinate.trim()) {
    try {
      const coords = venue.gps_coordinate.split(",").map((c) => {
        const parsed = parseFloat(c.trim());
        return isNaN(parsed) ? 0 : parsed;
      });
      latitude = coords[0] || 0;
      longitude = coords[1] || 0;
      hasValidCoordinates = latitude !== 0 || longitude !== 0;
    } catch (error) {
      console.log("Error parsing coordinates:", error);
      hasValidCoordinates = false;
    }
  }

  // Format time
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const allPricingSchemes = fields.flatMap((field) => field.pricing_schemes || []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ backgroundColor: "#f9fafb", color: "#1a1a1a" }}>
        {/* Back Button */}
        <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-4 md:py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0d47a1] hover:text-[#f97316] font-semibold transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>

        {/* Photo Carousel */}
        <div className="mx-auto px-4 md:px-8 lg:px-[150px] pb-4 md:pb-8">
          <PhotoCarousel photos={photos} />
        </div>

        {/* Venue Info */}
        <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-4 md:py-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 mb-8 md:mb-12">
            {/* Title and Description */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-4 md:mb-6">{venue.venue_name}</h1>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">{venue.description}</p>
            </div>

            {/* Location Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Address and City */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#0d47a1] mt-1 flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#1a1a1a] mb-1 text-sm md:text-base">Alamat</h3>
                    <p className="text-gray-600 text-sm md:text-base break-words">{venue.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="text-[#0d47a1] mt-1 flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] mb-1 text-sm md:text-base">Kota</h3>
                    <p className="text-gray-600 text-sm md:text-base">{venue.city}</p>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="text-[#0d47a1] mt-1 flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] mb-1 text-sm md:text-base">Jam Operasional</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
                    </p>
                  </div>
                </div>

                {/* GPS Coordinates */}
                <div className="bg-blue-50 border border-[#0d47a1]/20 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm font-semibold text-[#1a1a1a] mb-1">Koordinat GPS</p>
                  {hasValidCoordinates ? (
                    <p className="text-xs md:text-sm text-gray-600 break-all">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-xs md:text-sm text-gray-500 italic">Tidak tersedia</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-4 md:mb-6">Lokasi</h2>
            {hasValidCoordinates ? (
              <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="border-2 border-[#0d47a1] rounded-xl p-4 md:p-6 lg:p-8 hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-[#0d47a1] rounded-full p-3 md:p-4 flex-shrink-0 group-hover:bg-[#f97316] transition-colors">
                      <MapPin className="text-white w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-[#1a1a1a] mb-1 md:mb-2">Lihat Lokasi di Google Maps</h3>
                      <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 break-all">
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </p>
                      <div className="flex items-center gap-2 text-[#0d47a1] font-semibold group-hover:text-[#f97316] transition-colors">
                        <span className="text-sm md:text-base">Buka di Google Maps</span>
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ) : (
              <div className="border-2 border-gray-200 rounded-xl p-4 md:p-6 lg:p-8 bg-gray-50">
                <p className="text-gray-600 text-center py-8">Koordinat lokasi tidak tersedia</p>
              </div>
            )}
          </div>

          {/* Field List */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
            <FieldList fields={fields} bookings={bookingsData} pricingSchemes={allPricingSchemes} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
