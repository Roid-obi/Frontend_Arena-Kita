"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import VenueCard from "@/components/VenueCard";
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

// Categories will be loaded from API /home
interface CategoryItem {
  id: number;
  name: string;
  image: string;
}

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
  fields?: {
    id: number;
    name: string;
    type: string;
    status: string;
  }[];
  sportTypes?: string[];
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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [recPage, setRecPage] = useState(1);
  const recPerPage = 9;
  const [loading, setLoading] = useState(true);
  const [hoveredCarousel, setHoveredCarousel] = useState<string | null>(null);

  // Fetch home data from API
  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://dev.api.arenakita.my.id/api/v1/home");
        const result = await response.json();

        if (result.status === "success" && result.data) {
          const homeData = result.data as {
            categories: string[];
            nearest: VenueAPI[];
            recommendations: VenueAPI[];
          };

          // Helper to normalize photo URLs
          const normalizePhotoUrl = (url: string): string => {
            if (url.startsWith("http://") || url.startsWith("https://")) {
              return url;
            }
            return `https://dev.api.arenakita.my.id/storage/${url}`;
          };

          // Fetch field types for each venue (for badges)
          const fetchVenueDetails = async (venueId: number): Promise<string[]> => {
            try {
              const detailResponse = await fetch(`https://dev.api.arenakita.my.id/api/v1/venues/${venueId}`);
              const detailResult = await detailResponse.json();
              if (detailResult.status === "success" && detailResult.data?.fields) {
                const uniqueTypes = Array.from(new Set(detailResult.data.fields.map((field: { type: string }) => field.type.charAt(0).toUpperCase() + field.type.slice(1).toLowerCase())));
                return uniqueTypes as string[];
              }
              return [];
            } catch (error) {
              console.error(`Error fetching venue ${venueId} details:`, error);
              return [];
            }
          };

          // Build categories from API
          const categoryItems: CategoryItem[] = (homeData.categories || []).map((name, idx) => ({
            id: idx + 1,
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            image: `https://placehold.co/300x200/0d47a1/ffffff?text=${encodeURIComponent(name)}`,
          }));
          setCategories(categoryItems);

          // Fetch sport types for nearest and recommendations
          const nearestWithFields = await Promise.all(
            (homeData.nearest || []).map(async (venue) => {
              const sportTypes = await fetchVenueDetails(venue.id);
              return { ...venue, sportTypes };
            })
          );

          const recommendationsWithFields = await Promise.all(
            (homeData.recommendations || []).map(async (venue) => {
              const sportTypes = await fetchVenueDetails(venue.id);
              return { ...venue, sportTypes };
            })
          );

          // Transform API data to match component structure
          const transformedVenues = nearestWithFields.slice(0, 5).map((venue) => ({
            id: venue.id,
            name: venue.venue_name,
            location: venue.city,
            hours: venue.opening_time && venue.closing_time ? `${venue.opening_time.slice(0, 5)} - ${venue.closing_time.slice(0, 5)}` : "Hubungi Venue",
            images:
              venue.photos && venue.photos.length > 0
                ? venue.photos.map((photo) => normalizePhotoUrl(photo.url))
                : [`https://placehold.co/400x300/0d47a1/ffffff?text=${encodeURIComponent(venue.venue_name)}`],
            sportTypes: venue.sportTypes,
            category: "Olahraga",
          }));

          const transformedRecommendations = recommendationsWithFields.map((venue) => ({
            id: venue.id,
            name: venue.venue_name,
            location: venue.city,
            hours: venue.opening_time && venue.closing_time ? `${venue.opening_time.slice(0, 5)} - ${venue.closing_time.slice(0, 5)}` : "Hubungi Venue",
            images:
              venue.photos && venue.photos.length > 0
                ? venue.photos.map((photo) => normalizePhotoUrl(photo.url))
                : [`https://placehold.co/400x300/0d47a1/ffffff?text=${encodeURIComponent(venue.venue_name)}`],
            sportTypes: venue.sportTypes,
          }));

          setVenues(transformedVenues);
          setRecommendations(transformedRecommendations);
          setRecPage(1);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
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
          <div className="relative -mx-4 md:-mx-8 lg:mx-0" onMouseEnter={() => setHoveredCarousel("category")} onMouseLeave={() => setHoveredCarousel(null)}>
            <div className="px-0 md:px-8 lg:px-0">
              <div
                id="category-container"
                className="flex md:grid gap-4 overflow-x-auto md:overflow-visible px-4 md:px-0 pb-6 md:[grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))]"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/venues?sport_type=${category.name.toLowerCase()}`}
                    className="flex-none md:flex-initial w-40 h-24 md:w-auto md:h-auto md:aspect-[5/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer transition-transform duration-200 relative flex items-center justify-center hover:scale-[1.02]"
                    style={{
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <h3 className="font-semibold text-sm md:text-base text-white drop-shadow text-center truncate">{category.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <button onClick={() => scrollCategory("prev")} className="hidden">
              <ChevronLeft size={24} />
            </button>

            <button onClick={() => scrollCategory("next")} className="hidden">
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
            <div className="relative -mx-4 md:-mx-8 lg:mx-0" onMouseEnter={() => setHoveredCarousel("venue")} onMouseLeave={() => setHoveredCarousel(null)}>
              <div className="lg:px-0">
                <div
                  id="venue-container"
                  className="flex space-x-4 overflow-x-auto px-4 md:px-0 pb-6"
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
                className={`hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10 transition-opacity duration-300 ${
                  hoveredCarousel === "venue" ? "opacity-100" : "opacity-0"
                }`}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={() => scrollVenue("next")}
                className={`hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10 transition-opacity duration-300 ${
                  hoveredCarousel === "venue" ? "opacity-100" : "opacity-0"
                }`}
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
