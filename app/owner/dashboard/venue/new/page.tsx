"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
      const res = await fetch(`https://dev.api.arenakita.my.id/api/v1/owners/venues`, {
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
          <label className="block text-sm">Nama Venue</label>
          <input name="venue_name" value={form.venue_name} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block text-sm">Deskripsi</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Alamat</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm">Kota</label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
          </div>
        </div>
        <div>
          <label className="block text-sm">Koordinat GPS (opsional)</label>
          <input name="gps_coordinate" value={form.gps_coordinate} onChange={handleChange} placeholder="Contoh: -6.2088,106.8456" className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Buka</label>
            <input type="time" name="opening_time" value={form.opening_time} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm">Tutup</label>
            <input type="time" name="closing_time" value={form.closing_time} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
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
