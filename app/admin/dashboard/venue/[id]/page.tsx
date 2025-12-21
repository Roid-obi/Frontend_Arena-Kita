"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { API_BASE_URL, getStorageUrl } from "@/lib/api";
import Link from "next/link";
import { MapPin, Clock, User, Mail, Image as ImageIcon, BadgeCheck, ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react";

interface AdminVenueDetail {
  id: number;
  venue_name: string;
  city: string | null;
  owner?: { id: number; name: string; email: string } | null;
  address: string | null;
  description: string | null;
  gps_coordinate: string | null;
  opening_time: string | null;
  closing_time: string | null;
  photos: { id: number; url: string }[];
  fields: { id: number; name: string; type: string; status: string; photo_url: string | null }[];
  created_at?: string | null;
}

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    // If already absolute URL
    if (/^https?:\/\//i.test(url)) return url;
    return getStorageUrl(url);
  } catch {
    return url || null;
  }
}

export default function AdminVenueDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [detail, setDetail] = useState<AdminVenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    venue_name: "",
    city: "",
    address: "",
    description: "",
    opening_time: "",
    closing_time: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/admin/venues/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`API error ${res.status} ${txt}`);
        }
        const json = await res.json();
        if (json?.status === "success" && json.data) {
          // Normalize photo and field URLs
          const normalized: AdminVenueDetail = {
            ...json.data,
            photos: Array.isArray(json.data.photos) ? json.data.photos.map((p: { id: number; url: string }) => ({ id: p.id, url: normalizeUrl(p.url) || "" })) : [],
            fields: Array.isArray(json.data.fields)
              ? json.data.fields.map((f: { id: number; name: string; type: string; status: string; photo_url: string | null }) => ({
                  ...f,
                  photo_url: normalizeUrl(f.photo_url),
                }))
              : [],
          };
          setDetail(normalized);
          setForm({
            venue_name: normalized.venue_name || "",
            city: normalized.city || "",
            address: normalized.address || "",
            description: normalized.description || "",
            opening_time: (normalized.opening_time || "").slice(0, 5),
            closing_time: (normalized.closing_time || "").slice(0, 5),
          });
        } else {
          throw new Error(json?.message || "Gagal mengambil detail venue");
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error(err);
        setError(err.message || "Terjadi kesalahan saat mengambil detail venue");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!id || !detail) return;
    try {
      setUpdating(true);
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      const opening_time = form.opening_time.length === 5 ? form.opening_time + ":00" : form.opening_time;
      const closing_time = form.closing_time.length === 5 ? form.closing_time + ":00" : form.closing_time;
      const payload = { ...form, opening_time, closing_time };

      const res = await fetch(`${API_BASE_URL}/admin/venues/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Update failed: ${res.status} ${txt}`);
      }

      const json = await res.json();
      if (json?.status === "success" && json.data) {
        const normalized: AdminVenueDetail = {
          ...json.data,
          photos: Array.isArray(json.data.photos) ? json.data.photos.map((p: { id: number; url: string }) => ({ id: p.id, url: normalizeUrl(p.url) || "" })) : [],
          fields: Array.isArray(json.data.fields)
            ? json.data.fields.map((f: { id: number; name: string; type: string; status: string; photo_url: string | null }) => ({
                ...f,
                photo_url: normalizeUrl(f.photo_url),
              }))
            : [],
        };
        setDetail(normalized);
        setEditing(false);
      } else {
        throw new Error(json?.message || "Gagal update venue");
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat update venue");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Hapus venue ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      setDeleting(true);
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
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
        const txt = await res.text();
        throw new Error(`Delete failed: ${res.status} ${txt}`);
      }

      const json = await res.json();
      if (json?.status === "success") {
        window.location.href = "/admin/dashboard/venue";
      } else {
        throw new Error(json?.message || "Gagal hapus venue");
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat hapus venue");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      {/* Back button */}
      <div className="mb-4">
        <Link href="/admin/dashboard/venue" className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm">
          <ArrowLeft size={16} />
          <span>Kembali ke daftar venue</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Detail Venue</h1>
        <p className="text-gray-600">Informasi lengkap venue dan lapangan.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button onClick={() => (editing ? setEditing(false) : setEditing(true))} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm">
          {editing ? (
            <>
              <X size={16} />
              <span>Batal</span>
            </>
          ) : (
            <>
              <Pencil size={16} />
              <span>Edit</span>
            </>
          )}
        </button>
        {editing && (
          <button onClick={handleUpdate} disabled={updating} className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm disabled:opacity-50">
            <Save size={16} />
            <span>{updating ? "Menyimpan..." : "Simpan"}</span>
          </button>
        )}
        <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm disabled:opacity-50 ml-auto">
          <Trash2 size={16} />
          <span>{deleting ? "Menghapus..." : "Hapus"}</span>
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <>
          <div className="mb-6 h-36 md:h-48 rounded-xl bg-gray-100 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </>
      ) : detail ? (
        <>
          {/* Edit Mode */}
          {editing && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-[#0d47a1] mb-4">Edit Venue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Venue</label>
                  <input
                    type="text"
                    name="venue_name"
                    value={form.venue_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Buka</label>
                  <input
                    type="time"
                    name="opening_time"
                    value={form.opening_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tutup</label>
                  <input
                    type="time"
                    name="closing_time"
                    value={form.closing_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* View Mode */}
          {!editing && (
            <>
              {/* Header Card */}
              <div className="bg-gradient-to-r from-[#0d47a1] to-[#1a5490] text-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold">{detail.venue_name}</h2>
                    <div className="mt-2 space-y-1 text-sm opacity-90">
                      {detail.city && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{detail.city}</span>
                        </div>
                      )}
                      {detail.opening_time && detail.closing_time && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>
                            {detail.opening_time.slice(0, 5)} - {detail.closing_time.slice(0, 5)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {detail.owner && (
                    <div className="bg-white/15 rounded-lg border border-white/30 p-4">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <User size={16} /> Pemilik
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <BadgeCheck size={16} /> {detail.owner.name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail size={16} /> {detail.owner.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description and Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-md p-5">
                  <h3 className="text-lg font-semibold text-[#0d47a1] mb-2">Deskripsi</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{detail.description || "-"}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5">
                  <h3 className="text-lg font-semibold text-[#0d47a1] mb-2">Alamat</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{detail.address || "-"}</p>
                </div>
              </div>

              {/* Photos */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={18} className="text-[#0d47a1]" />
                  <h3 className="text-lg font-semibold text-[#0d47a1]">Foto Venue</h3>
                </div>
                {detail.photos && detail.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {detail.photos.map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p.id} src={p.url} alt={`Venue Photo ${p.id}`} className="w-full h-36 md:h-40 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Belum ada foto untuk venue ini</div>
                )}
              </div>

              {/* Fields */}
              <div>
                <h3 className="text-lg font-semibold text-[#0d47a1] mb-3">Lapangan</h3>
                {detail.fields && detail.fields.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {detail.fields.map((f) => (
                      <div key={f.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={normalizeUrl(f.photo_url) || "https://placehold.co/400x240/0d47a1/ffffff?text=Field"} alt={f.name} className="w-full h-32 md:h-36 object-cover" />
                        <div className="p-4">
                          <h4 className="text-base font-semibold text-gray-900">{f.name}</h4>
                          <p className="text-xs text-gray-600">Jenis: {f.type}</p>
                          <p className="text-xs text-gray-600">Status: {f.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Belum ada data lapangan</div>
                )}
              </div>
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
