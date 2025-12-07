"use client";

import { use } from "react";
import { Clock, MapPin, Building2, ExternalLink } from "lucide-react";
import PhotoCarousel from "@/components/PhotoCarousel";
import FieldList from "@/components/FieldList";
import venuesData from "@/data/dummy/venues.json";
import photosData from "@/data/dummy/venue_photos.json";
import fieldsData from "@/data/dummy/fields.json";
import bookingsData from "@/data/dummy/bookings.json";
import pricingSchemesData from "@/data/dummy/pricing_schemes.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      <div className="min-h-screen bg-gray-50">
        {/* Photo Carousel */}
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <PhotoCarousel photos={photos} />
          </div>
        </div>

        {/* Venue Info */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            {/* Title and Description */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{venue.venue_name}</h1>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl">{venue.description}</p>
            </div>

            {/* Location Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              {/* Address and City */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="text-blue-600 mt-1 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Alamat</h3>
                    <p className="text-gray-600 text-sm sm:text-base break-words">{venue.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Building2 className="text-blue-600 mt-1 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Kota</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{venue.city}</p>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Clock className="text-blue-600 mt-1 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Jam Operasional</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
                    </p>
                  </div>
                </div>

                {/* GPS Coordinates */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Koordinat GPS</p>
                  <p className="text-xs sm:text-sm text-gray-600 break-all">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Lokasi</h2>
            <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="border-2 border-blue-600 rounded-lg p-4 sm:p-6 md:p-8 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-blue-600 rounded-full p-3 sm:p-4 flex-shrink-0 group-hover:bg-blue-700 transition-colors">
                    <MapPin className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Lihat Lokasi di Google Maps</h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 break-all">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                      <span className="text-sm sm:text-base">Buka di Google Maps</span>
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Field List */}
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <FieldList fields={fields} bookings={bookingsData} pricingSchemes={pricingSchemesData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
