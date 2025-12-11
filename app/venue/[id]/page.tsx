"use client";

import { use } from "react";
import { Clock, MapPin, Building2, ExternalLink, ArrowLeft } from "lucide-react";
import PhotoCarousel from "@/components/PhotoCarousel";
import FieldList from "@/components/FieldList";
import venuesData from "@/data/dummy/venues.json";
import photosData from "@/data/dummy/venue_photos.json";
import fieldsData from "@/data/dummy/fields.json";
import bookingsData from "@/data/dummy/bookings.json";
import pricingSchemesData from "@/data/dummy/pricing_schemes.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VenueDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const venueId = parseInt(id);

  // Get venue data
  const venue = venuesData.find((v) => v.id === venueId);

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Venue Tidak Ditemukan</h1>
          <p className="text-gray-600">Venue dengan ID {venueId} tidak tersedia.</p>
        </div>
      </div>
    );
  }

  // Get related photos
  const photos = photosData.filter((p) => p.venue_id === venueId);

  // Get related fields
  const fields = fieldsData.filter((f) => f.venue_id === venueId);

  // Parse GPS coordinate
  const [latitude, longitude] = venue.gps_coordinate.split(",").map((c) => parseFloat(c.trim()));

  // Format time
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

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
                  <p className="text-xs md:text-sm text-gray-600 break-all">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-4 md:mb-6">Lokasi</h2>
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
          </div>

          {/* Field List */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
            <FieldList fields={fields} bookings={bookingsData} pricingSchemes={pricingSchemesData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
