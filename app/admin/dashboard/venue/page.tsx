"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { Eye, Trash2, MapPin, Clock, Plus } from "lucide-react";
import { API_BASE_URL, getStorageUrl } from "@/lib/api";

interface AdminVenueItem {
  id: number;
  owner_id: number;
  venue_name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  gps_coordinate: string | null;
  opening_time: string | null;
  closing_time: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  owner?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  } | null;
}

const ImageCarousel: React.FC<{ images: string[]; alt: string; placeholder: string }> = ({ images, alt, placeholder }) => {
  const fallbackImages = images.length ? images : [placeholder];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const activeIndex = fallbackImages.length ? currentIndex % fallbackImages.length : 0;

  useEffect(() => {
    if (fallbackImages.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % fallbackImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [fallbackImages.length, isHovered]);

  return (
    <div className="relative w-full h-40 bg-gray-100 overflow-hidden" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {fallbackImages.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${idx}`}
          src={src}
          alt={`${alt} - ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${idx === activeIndex ? "opacity-100" : "opacity-0"}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholder;
          }}
        />
      ))}

      {fallbackImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {fallbackImages.map((_, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? "bg-white" : "bg-white opacity-50"}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminVenue() {
  const [venues, setVenues] = useState<AdminVenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const PLACEHOLDER_IMG = "https://placehold.co/300x200/0d47a1/ffffff?text=Venue";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }

        // Fetch venues
        const res = await fetch(`${API_BASE_URL}/admin/venues`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API error: ${res.status} ${errText}`);
        }

        const json = await res.json();
        if (json && json.status === "success" && Array.isArray(json.data)) {
          setVenues(json.data);
        } else {
          setError(json.message || "Gagal memuat data");
        }
      } catch (e: Error | unknown) {
        console.error(e);
        setError((e instanceof Error ? e.message : String(e)) || "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus venue ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      setDeletingId(id);
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/admin/venues/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed: ${res.status} ${text}`);
      }
      const json = await res.json();
      if (json?.status === "success") {
        setVenues((prev) => prev.filter((v) => v.id !== id));
      } else {
        throw new Error(json?.message || "Gagal menghapus");
      }
    } catch (e: Error | unknown) {
      console.error(e);
      alert((e instanceof Error ? e.message : String(e)) || "Gagal menghapus venue");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter venues berdasarkan search query
  const filteredVenues = venues.filter(
    (v) =>
      v.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toString().includes(searchQuery)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVenues = filteredVenues.slice(startIndex, endIndex);

  // Reset ke halaman 1 ketika search query berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col gap-1 sm:gap-2 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#0d47a1]">Kelola Semua Venue</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">Kelola venue di platform dan lapangan yang terkait.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 sm:mb-6">
        <div className="w-full md:w-64">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari venue atau pemilik..." />
        </div>
        <Link href="/admin/dashboard/venue/new" className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] text-sm">
          <Plus size={16} />
          <span>Tambah Venue</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-6 sm:p-8 text-center text-gray-600">Memuat data venue...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-red-200 text-sm sm:text-base">{error}</div>
      ) : currentVenues.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-lg p-6 sm:p-8 text-center text-gray-600 text-sm sm:text-base">Tidak ada venue yang cocok dengan pencarian</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {currentVenues.map((v) => (
              <div key={v.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100">
                <ImageCarousel images={[]} alt={v.venue_name} placeholder={PLACEHOLDER_IMG} />
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {/* Venue Info */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{v.venue_name}</h3>
                    {v.description && <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{v.description}</p>}
                  </div>

                  {/* Owner Info */}
                  {v.owner && (
                    <div className="bg-blue-50 rounded p-2 sm:p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-700">Pemilik:</p>
                      <p className="text-xs sm:text-sm text-gray-900">{v.owner.full_name}</p>
                      <p className="text-xs text-gray-600">{v.owner.email}</p>
                    </div>
                  )}

                  {/* Location & Time */}
                  <div className="space-y-1">
                    {v.city && (
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="line-clamp-1">{v.city}</span>
                      </p>
                    )}
                    {v.opening_time && v.closing_time && (
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                        <Clock size={14} className="flex-shrink-0" />
                        <span>
                          {v.opening_time.slice(0, 5)} - {v.closing_time.slice(0, 5)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 sm:pt-3">
                    <Link
                      href={`/admin/dashboard/venue/${v.id}`}
                      className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex-1 transition"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">Lihat</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex-1"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">{deletingId === v.id ? "..." : "Hapus"}</span>
                      <span className="sm:hidden">{deletingId === v.id ? "..." : "×"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVenues.length > itemsPerPage && (
            <div className="mt-4 sm:mt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
