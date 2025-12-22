"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api";
import LocationPicker from "@/components/LocationPicker";

export default function NewVenuePage() {
  const [form, setForm] = useState({ venue_name: "", address: "", city: "", description: "", gps_coordinate: "", opening_time: "08:00", closing_time: "22:00" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }
      // Pastikan format jam operasional "HH:mm:ss"
      const opening_time = form.opening_time.length === 5 ? form.opening_time + ":00" : form.opening_time;
      const closing_time = form.closing_time.length === 5 ? form.closing_time + ":00" : form.closing_time;
      const payload = { ...form, opening_time, closing_time };
      const res = await fetch(`${API_BASE_URL}/owners/venues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        router.push("/owner/dashboard/venue");
      } else {
        setError(json.message || "Gagal membuat venue");
      }
    } catch (e: Error | unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Tambah Venue Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 border rounded">
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Venue</label>
          <input
            name="venue_name"
            value={form.venue_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi di Peta</label>
          <LocationPicker value={form.gps_coordinate} onChange={(value) => setForm((prev) => ({ ...prev, gps_coordinate: value }))} className="mb-2" />
          <input
            name="gps_coordinate"
            value={form.gps_coordinate}
            onChange={handleChange}
            placeholder="Contoh: -6.208800,106.845600"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Koordinat akan terisi otomatis saat memilih di peta (format: lat,lng).</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buka</label>
            <input
              type="time"
              name="opening_time"
              value={form.opening_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutup</label>
            <input
              type="time"
              name="closing_time"
              value={form.closing_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-[#0d47a1] text-white rounded">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => router.push("/owner/dashboard/venue")} className="px-4 py-2 bg-gray-200 rounded">
            Batal
          </button>
        </div>
      </form>
    </section>
  );
}
