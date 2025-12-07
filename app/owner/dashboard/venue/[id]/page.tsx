"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface VenueDetail {
  id: number;
  owner_id: number;
  venue_name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  gps_coordinate: string | null;
  opening_time: string | null;
  closing_time: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  venue_photo?: { id: number; venue_id: number; photo_url: string }[];
}

export default function OwnerVenueDetail() {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ venue_name: "", address: "", city: "", description: "", gps_coordinate: "", opening_time: "", closing_time: "" });
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/proxy/owners/venues/${id}`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        if (json?.status === "success") {
          setVenue(json.data);
          setForm({
            venue_name: json.data.venue_name || "",
            address: json.data.address || "",
            city: json.data.city || "",
            description: json.data.description || "",
            gps_coordinate: json.data.gps_coordinate || "",
            opening_time: (json.data.opening_time || "").slice(0, 5),
            closing_time: (json.data.closing_time || "").slice(0, 5),
          });
        } else {
          setError(json.message || "Gagal memuat detail");
        }
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(error);
        setError(error.message || "Terjadi kesalahan saat memuat detail");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!id) return;
      // Pastikan format jam operasional "HH:mm:ss"
      const opening_time = form.opening_time.length === 5 ? form.opening_time + ":00" : form.opening_time;
      const closing_time = form.closing_time.length === 5 ? form.closing_time + ":00" : form.closing_time;
      const payload = { ...form, opening_time, closing_time };
      const res = await fetch(`/api/proxy/owners/venues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        setVenue(json.data);
        setEditing(false);
      } else {
        alert(json.message || "Gagal update");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal update");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus venue ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      if (!id) return;
      const res = await fetch(`/api/proxy/owners/venues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        router.push("/owner/dashboard/venue");
      } else {
        alert(json.message || "Gagal menghapus");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal menghapus");
    }
  };

  if (loading) return <div>Memuat detail...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!venue) return <div>Tidak ada data</div>;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#0d47a1]">{venue.venue_name}</h1>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="px-3 py-1 rounded bg-[#0d47a1] text-white">
            {editing ? "Batal" : "Edit"}
          </button>
          <button onClick={handleDelete} className="px-3 py-1 rounded bg-red-500 text-white">
            Hapus
          </button>
        </div>
      </div>

      {!editing ? (
        <div className="space-y-3">
          <p className="text-gray-700">{venue.description}</p>
          <p className="text-sm text-gray-600">Alamat: {venue.address}</p>
          <p className="text-sm text-gray-600">Kota: {venue.city}</p>
          <p className="text-sm text-gray-600">
            Jam: {(venue.opening_time || "").slice(0, 5)} - {(venue.closing_time || "").slice(0, 5)}
          </p>
          {venue.gps_coordinate && <p className="text-sm text-gray-600">Koordinat GPS: {venue.gps_coordinate}</p>}
          {venue.created_at && <p className="text-xs text-gray-500">Dibuat: {new Date(venue.created_at).toLocaleString("id-ID")}</p>}
          {venue.updated_at && <p className="text-xs text-gray-500">Diperbarui: {new Date(venue.updated_at).toLocaleString("id-ID")}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {(venue.venue_photo || []).map((p) => (
              <img key={p.id} src={p.photo_url} alt="photo" className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Nama Venue</label>
            <input name="venue_name" value={form.venue_name} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Alamat</label>
              <input name="address" value={form.address} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Kota</label>
              <input name="city" value={form.city} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Koordinat GPS (opsional)</label>
            <input name="gps_coordinate" value={form.gps_coordinate} onChange={handleChange} placeholder="Contoh: -6.2088,106.8456" className="w-full border px-2 py-1 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Buka</label>
              <input name="opening_time" type="time" value={form.opening_time} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Tutup</label>
              <input name="closing_time" type="time" value={form.closing_time} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-[#0d47a1] text-white rounded">
              Simpan
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 rounded">
              Batal
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
