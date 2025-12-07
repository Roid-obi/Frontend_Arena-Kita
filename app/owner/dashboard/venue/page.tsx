"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

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

export default function OwnerVenue() {
  const [venues, setVenues] = useState<OwnerVenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

        // Call local proxy to avoid CORS / preflight redirect issues
        const res = await fetch("/api/proxy/owners/venues");

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
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Terjadi kesalahan saat memuat data");
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
      const res = await fetch(`/api/proxy/owners/venues/${id}`, { method: "DELETE" });
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
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Gagal menghapus venue");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Kelola Venue</h1>
      <p className="text-gray-600 mb-4">Kelola venue Anda dan lapangan yang terkait.</p>

      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="sr-only">Daftar Venue</h2>
        </div>
        <div>
          <Link href="/owner/dashboard/venue/new" className="inline-block px-4 py-2 bg-[#0d47a1] text-white rounded-md">
            Tambah Venue
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-4 bg-white border rounded">Memuat data venue...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
      ) : (
        <div className="overflow-auto bg-white border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Venue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kota</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Operasional</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venues.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{v.venue_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.city || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{v.address || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {(v.opening_time || "-").slice(0, 5)} - {(v.closing_time || "-").slice(0, 5)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.owner?.full_name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/owner/dashboard/venue/${v.id}`} className="px-3 py-1 rounded bg-white border text-[#0d47a1] text-sm">
                        Lihat
                      </Link>
                      <button onClick={() => handleDelete(v.id)} disabled={deletingId === v.id} className="px-3 py-1 rounded bg-red-500 text-white text-sm">
                        {deletingId === v.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
