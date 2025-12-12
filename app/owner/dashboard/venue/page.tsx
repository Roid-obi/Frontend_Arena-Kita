"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { PlusCircle, Eye, Trash2 } from "lucide-react";

interface OwnerVenueItem {
  id: number;
  owner_id: number;
  venue_name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  gps_coordinate: string | null;
  opening_time: string | null;
  closing_time: string | null;
  owner?: { id: number; full_name: string; email: string } | null;
}

const ImageCarousel: React.FC<{ images: string[]; alt: string; placeholder: string }> = ({ images, alt, placeholder }) => {
  const fallbackImages = images.length ? images : [placeholder];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const activeIndex = fallbackImages.length ? currentIndex % fallbackImages.length : 0;

  // Auto-cycle images when not hovered to mimic home card behavior
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

export default function OwnerVenue() {
  const [venues, setVenues] = useState<OwnerVenueItem[]>([]);
  const [venuePhotos, setVenuePhotos] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const PLACEHOLDER_IMG = "https://placehold.co/300x200/0d47a1/ffffff?text=Venue";

  const getPhotoUrl = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `https://dev.api.arenakita.my.id/storage/${url}`;
  };

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }

        const res = await fetch("https://dev.api.arenakita.my.id/api/v1/owners/venues", {
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
          // Fetch photos for each venue in parallel
          try {
            const token2 = Cookies.get("token");
            if (token2) {
              const photoResults = await Promise.all(
                json.data.map(async (v: OwnerVenueItem) => {
                  try {
                    const pr = await fetch(`https://dev.api.arenakita.my.id/api/v1/owners/venues/${v.id}/photos`, {
                      headers: { Authorization: `Bearer ${token2}`, Accept: "application/json" },
                    });
                    const pj = await pr.json();
                    if (pj?.status === "success" && Array.isArray(pj.data)) {
                      const urls: string[] = pj.data
                        .map((p: { photo_url?: string; url?: string }) => p.url || p.photo_url || "")
                        .filter(Boolean)
                        .map((raw: string) => (raw.startsWith("http") ? raw : `https://dev.api.arenakita.my.id/storage/${raw}`));
                      return { id: v.id, urls };
                    }
                  } catch (e) {
                    console.warn("Fetch photos failed for venue", v.id, e);
                  }
                  return { id: v.id, urls: [] as string[] };
                })
              );
              const map: Record<number, string[]> = {};
              photoResults.forEach((r) => (map[r.id] = r.urls));
              setVenuePhotos(map);
            }
          } catch (e) {
            console.warn("Bulk fetch venue photos failed", e);
          }
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

    fetchVenues();
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
      const res = await fetch(`https://dev.api.arenakita.my.id/api/v1/owners/venues/${id}`, {
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
    <section>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Kelola Venue</h1>
        <p className="text-gray-600">Kelola venue Anda dan lapangan yang terkait.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="w-full md:w-64">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari venue..." />
        </div>
        <Link href="/owner/dashboard/venue/new" className="inline-flex items-center gap-2 px-3 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] text-sm">
          <PlusCircle size={16} />
          <span>Tambah Venue</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">Memuat data venue...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 rounded-xl shadow-sm p-6 border border-red-200">{error}</div>
      ) : currentVenues.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">Tidak ada venue yang cocok dengan pencarian</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentVenues.map((v) => (
              <div key={v.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100">
                {(() => {
                  const photos = (venuePhotos[v.id] || []).map((p) => getPhotoUrl(p) || "").filter(Boolean);
                  return <ImageCarousel images={photos} alt={v.venue_name} placeholder={PLACEHOLDER_IMG} />;
                })()}
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{v.venue_name}</h3>
                    {v.description && <p className="text-sm text-gray-600 mb-2 line-clamp-1">{v.description}</p>}
                  </div>

                  <p className="text-sm text-gray-600">Lokasi: {v.city || "-"}</p>
                  <p className="text-xs text-gray-500">
                    Jam: {(v.opening_time || "-").slice(0, 5)} - {(v.closing_time || "-").slice(0, 5)}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/owner/dashboard/venue/${v.id}`} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                      <Eye size={14} /> Lihat
                    </Link>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} /> {deletingId === v.id ? "..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVenues.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
