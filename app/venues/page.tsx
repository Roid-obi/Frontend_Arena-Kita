"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VenueCard from "@/components/VenueCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  sportTypes?: string[];
}

interface TransformedVenue {
  id: number;
  name: string;
  location: string;
  hours: string;
  images: string[];
  sportTypes?: string[];
}

const sportTypeOptions = [
  { label: "Semua Olahraga", value: "" },
  { label: "Futsal", value: "futsal" },
  { label: "Basket", value: "basket" },
  { label: "Badminton", value: "badminton" },
  { label: "Voli", value: "voli" },
  { label: "Padel", value: "padel" },
];

const VenuesPage = () => {
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState<TransformedVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sportType, setSportType] = useState<string>(searchParams.get("sport_type") || "");
  const [city, setCity] = useState<string>(searchParams.get("city") || "");
  const [cities, setCities] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 9;
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("limit", String(limit));
        params.append("page", String(page));
        if (search.trim()) params.append("search", search.trim());
        if (sportType) params.append("sport_type", sportType);
        if (city) params.append("city", city);

        const response = await fetch(`https://dev.api.arenakita.my.id/api/v1/venues?${params.toString()}`);
        const result = await response.json();
        if (result.status === "success" && result.data) {
          const venuesData: VenueAPI[] = result.data;

          const normalizePhotoUrl = (url: string): string => {
            if (url.startsWith("http://") || url.startsWith("https://")) return url;
            return `https://dev.api.arenakita.my.id/storage/${url}`;
          };

          const fetchVenueDetails = async (venueId: number): Promise<string[]> => {
            try {
              const detailResponse = await fetch(`https://dev.api.arenakita.my.id/api/v1/venues/${venueId}`);
              const detailResult = await detailResponse.json();
              if (detailResult.status === "success" && detailResult.data?.fields) {
                const uniqueTypes = Array.from(new Set(detailResult.data.fields.map((field: { type: string }) => field.type.charAt(0).toUpperCase() + field.type.slice(1).toLowerCase())));
                return uniqueTypes as string[];
              }
            } catch (error) {
              console.error(`Error fetching venue ${venueId} details:`, error);
            }
            return [];
          };

          const venuesWithTypes = await Promise.all(
            venuesData.map(async (venue) => {
              const sportTypes = await fetchVenueDetails(venue.id);
              return { ...venue, sportTypes };
            })
          );

          const transformed = venuesWithTypes.map((venue) => ({
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

          setVenues(transformed);
          setHasNext(venuesData.length === limit);
        } else {
          setVenues([]);
          setHasNext(false);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        setVenues([]);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [search, sportType, city, page]);

  // Fetch all cities for filter dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`https://dev.api.arenakita.my.id/api/v1/venues?limit=999`);
        const result = await response.json();
        if (result.status === "success" && result.data) {
          const venuesData: VenueAPI[] = result.data;
          const uniqueCities = Array.from(new Set(venuesData.map((v) => v.city).filter(Boolean))) as string[];
          setCities(uniqueCities.sort());
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sportType, city]);

  const filteredVenues = useMemo(() => venues, [venues]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9fafb", color: "#1a1a1a" }}>
      <Navbar />

      <main className="mx-auto px-4 md:px-8 lg:px-[150px] py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500">Temukan venue terbaik untuk olahraga kamu</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Semua Venue</h1>
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1] bg-white text-gray-800"
            >
              {sportTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1] bg-white text-gray-800"
            >
              <option value="">Semua Kota</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Cari nama atau kota venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600">Memuat semua venue...</div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-16 text-gray-600">Tidak ada venue ditemukan.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 hover:bg-[#0d47a1] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold text-gray-700">Halaman {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext || loading}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 hover:bg-[#0d47a1] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VenuesPage;
