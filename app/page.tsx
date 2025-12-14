"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import VenueCard from "@/components/VenueCard";
import fieldsData from "@/data/dummy/fields.json";
import Footer from "@/components/Footer";
import Banner1 from "../assets/image/Banner1.png";
import Banner2 from "../assets/image/Banner2.png";
import Banner3 from "../assets/image/Banner3.png";
import Image from "next/image";

// Dummy Data
const banners = [
  { id: 1, title: "Booking Lapangan Mudah", subtitle: "Temukan dan booking lapangan olahraga favoritmu", image: Banner1 },
  { id: 2, title: "Venue Terlengkap", subtitle: "Ratusan venue olahraga siap untuk kamu", image: Banner2 },
  { id: 3, title: "Harga Terjangkau", subtitle: "Dapatkan harga terbaik untuk lapangan impianmu", image: Banner3 },
];

// Extract unique sport types from fields data to create categories
const categories = Array.from(
  new Map(
    fieldsData.map((field) => [
      field.sport_type,
      {
        id: fieldsData.findIndex((f) => f.sport_type === field.sport_type) + 1,
        name: field.sport_type.charAt(0) + field.sport_type.slice(1).toLowerCase(),
        icon: "⚽",
        image: `https://placehold.co/300x200/0d47a1/ffffff?text=${field.sport_type.charAt(0) + field.sport_type.slice(1).toLowerCase()}`,
      },
    ])
  ).values()
);

interface VenueAPI {
  id: number;
  venue_name: string;
  description: string;
  address: string;
  city: string;
  gps_coordinate: string | null;
  opening_time: string | null;
  closing_time: string | null;
  thumbnail: string | null;
  photos: {
    id: number;
    url: string;
  }[];
}

interface TransformedVenue {
  id: number;
  name: string;
  location: string;
  hours: string;
  images: string[];
  category?: string;
}

const ArenaKita = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [venues, setVenues] = useState<TransformedVenue[]>([]);
  const [recommendations, setRecommendations] = useState<TransformedVenue[]>([]);
  const [recPage, setRecPage] = useState(1);
  const recPerPage = 9;
  const [loading, setLoading] = useState(true);

  // Fetch venues from API
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://dev.api.arenakita.my.id/api/v1/venues");
        const result = await response.json();

        if (result.status === "success" && result.data) {
          const venuesData: VenueAPI[] = result.data;

          // Helper to normalize photo URLs
          const normalizePhotoUrl = (url: string): string => {
            if (url.startsWith("http://") || url.startsWith("https://")) {
              return url;
            }
            return `https://dev.api.arenakita.my.id/storage/${url}`;
          };

          // Transform API data to match component structure
          const transformedVenues = venuesData.slice(0, 5).map((venue) => ({
            id: venue.id,
            name: venue.venue_name,
            location: venue.city,
            hours: venue.opening_time && venue.closing_time ? `${venue.opening_time.slice(0, 5)} - ${venue.closing_time.slice(0, 5)}` : "Hubungi Venue",
            images:
              venue.photos && venue.photos.length > 0
                ? venue.photos.map((photo) => normalizePhotoUrl(photo.url))
                : [`https://placehold.co/400x300/0d47a1/ffffff?text=${encodeURIComponent(venue.venue_name)}`],
            category: "Olahraga",
          }));

          const transformedRecommendations = venuesData.map((venue) => ({
            id: venue.id,
            name: venue.venue_name,
            location: venue.city,
            hours: venue.opening_time && venue.closing_time ? `${venue.opening_time.slice(0, 5)} - ${venue.closing_time.slice(0, 5)}` : "Hubungi Venue",
            images:
              venue.photos && venue.photos.length > 0
                ? venue.photos.map((photo) => normalizePhotoUrl(photo.url))
                : [`https://placehold.co/400x300/0d47a1/ffffff?text=${encodeURIComponent(venue.venue_name)}`],
          }));

          setVenues(transformedVenues);
          setRecommendations(transformedRecommendations);
          setRecPage(1);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const nextBanner = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setBannerIndex((prev) => (prev + 1) % banners.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const prevBanner = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const scrollCategory = (direction: "next" | "prev") => {
    const container = document.getElementById("category-container");
    if (container) {
      const scrollAmount = direction === "next" ? 300 : -300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollVenue = (direction: "next" | "prev") => {
    const container = document.getElementById("venue-container");
    if (container) {
      const scrollAmount = direction === "next" ? 300 : -300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const totalRecPages = Math.max(1, Math.ceil(recommendations.length / recPerPage));
  const paginatedRecommendations = recommendations.slice((recPage - 1) * recPerPage, recPage * recPerPage);

  const handleRecPageChange = (page: number) => {
    const next = Math.min(Math.max(page, 1), totalRecPages);
    setRecPage(next);
    const section = document.getElementById("rekomendasi-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (recPage > totalRecPages) {
      setRecPage(totalRecPages);
    }
  }, [recPage, totalRecPages]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9fafb", color: "#1a1a1a" }}>
      <Navbar />

      {/* Banner Carousel */}
      <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-4 md:py-8">
        <div className="relative h-64 md:h-96 overflow-hidden rounded-2xl shadow-xl group">
          {banners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === bannerIndex ? "opacity-100" : "opacity-0"}`}>
              <Image src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#00000079] bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">{banner.title}</h1>
                  <p className="text-sm md:text-xl">{banner.subtitle}</p>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevBanner}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-1 md:p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={24} className="sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextBanner}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-1 md:p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={24} className="sm:w-6 sm:h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setBannerIndex(idx);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }
                }}
                className={`w-2 h-2 md:w-2 md:h-2 rounded-full transition-all ${idx === bannerIndex ? "bg-white" : "bg-white opacity-50"}`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* <div className="mx-auto px-4 md:px-8 lg:px-[150px] "></div> */}

      <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-4 md:py-8">
        {/* Kategori */}
        <section className="mb-1 md:mb-5">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Kategori</h2>
          <div className="relative -mx-4 md:-mx-8 lg:mx-0">
            <div className="px-0 md:px-8 lg:px-0">
              <div
                id="category-container"
                className="flex space-x-4 overflow-x-auto px-2 pb-6"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex-none w-40 md:w-48 h-24 md:h-32 rounded-lg overflow-hidden shadow-lg cursor-pointer transition relative flex items-center justify-center"
                    style={{
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* <div className="absolute inset-0 bg-[#00000079]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="font-bold text-base md:text-lg text-white text-center px-2">{category.name}</h3>
                    </div> */}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => scrollCategory("prev")}
              className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => scrollCategory("next")}
              className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </section>

        {/* Terdekat */}
        <section className="mb-1 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Venue Terdekat</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat venue...</p>
            </div>
          ) : (
            <div className="relative -mx-4 md:-mx-8 lg:mx-0">
              <div className="lg:px-0">
                <div
                  id="venue-container"
                  className="flex space-x-4 overflow-x-auto px-2 pb-6"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {venues.map((venue) => (
                    <div key={venue.id} className="flex-none w-64 md:w-100">
                      <VenueCard venue={venue} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => scrollVenue("prev")}
                className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={() => scrollVenue("next")}
                className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </section>

        {/* Rekomendasi */}
        <section id="rekomendasi-section" className="">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Rekomendasi Venue</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Memuat rekomendasi...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginatedRecommendations.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>

              {recommendations.length > recPerPage && (
                <div className="mt-10 md:mt-20 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleRecPageChange(recPage - 1)}
                    disabled={recPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 hover:bg-[#0d47a1] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalRecPages }).map((_, idx) => {
                    const page = idx + 1;
                    const isActive = page === recPage;
                    return (
                      <button
                        key={page}
                        onClick={() => handleRecPageChange(page)}
                        className={`min-w-10 h-10 px-3 rounded-full border text-sm font-semibold transition shadow-sm ${
                          isActive ? "bg-[#0d47a1] text-white border-[#0d47a1]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handleRecPageChange(recPage + 1)}
                    disabled={recPage === totalRecPages}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 hover:bg-[#0d47a1] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ArenaKita;
