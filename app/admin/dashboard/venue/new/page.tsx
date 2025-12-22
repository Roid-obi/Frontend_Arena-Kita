"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api";
import LocationPicker from "@/components/LocationPicker";

interface Owner {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export default function AdminNewVenuePage() {
  const [form, setForm] = useState({
    owner_id: "",
    venue_name: "",
    address: "",
    city: "",
    description: "",
    gps_coordinate: "",
    opening_time: "08:00",
    closing_time: "22:00",
  });
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoadingOwners(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/admin/owners`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Gagal memuat data owner: ${res.status}`);

      const json = await res.json();
      if (json?.status === "success" && json.data) {
        setOwners(json.data);
      }
    } catch (e: Error | unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat memuat data owner");
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.venue_name.trim() || !form.city.trim() || !form.owner_id) {
      setError("Nama venue, kota, dan pemilik harus diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const opening_time = form.opening_time.length === 5 ? form.opening_time + ":00" : form.opening_time;
      const closing_time = form.closing_time.length === 5 ? form.closing_time + ":00" : form.closing_time;

      const payload = {
        owner_id: parseInt(form.owner_id),
        venue_name: form.venue_name,
        city: form.city,
        address: form.address,
        description: form.description,
        gps_coordinate: form.gps_coordinate,
        opening_time,
        closing_time,
      };

      const res = await fetch(`${API_BASE_URL}/admin/venues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API error: ${res.status} ${txt}`);
      }

      const json = await res.json();
      if (json?.status === "success") {
        router.push("/admin/dashboard/venue");
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
      <div className="mb-6">
        <Link href="/admin/dashboard/venue" className="text-[#0d47a1] hover:underline flex items-center gap-2">
          <span>&larr;</span> Kembali
        </Link>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Tambah Venue Baru</h1>
      <p className="text-gray-600 mb-6">Tambahkan venue baru untuk owner yang terdaftar.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 border rounded-lg shadow-md max-w-2xl">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pemilik Venue <span className="text-red-500">*</span>
          </label>
          <select
            name="owner_id"
            value={form.owner_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            required
            disabled={loadingOwners}
          >
            <option value="">Pilih pemilik venue...</option>
            {loadingOwners ? (
              <option disabled>Memuat pemilik...</option>
            ) : (
              owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.full_name} ({owner.email})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Venue <span className="text-red-500">*</span>
          </label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kota <span className="text-red-500">*</span>
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            />
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Buka</label>
            <input
              type="time"
              name="opening_time"
              value={form.opening_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tutup</label>
            <input
              type="time"
              name="closing_time"
              value={form.closing_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || loadingOwners}
            className="px-6 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Venue"}
          </button>
          <Link href="/admin/dashboard/venue" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-center">
            Batal
          </Link>
        </div>
      </form>
    </section>
  );
}
