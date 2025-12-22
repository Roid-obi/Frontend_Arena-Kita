"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Pencil, Trash2, X, Save } from "lucide-react";
import { API_BASE_URL, getStorageUrl } from "@/lib/api";

interface PricingScheme {
  id: number;
  duration_minutes: number;
  price: string;
  raw_price: number;
  description: string;
}

interface Venue {
  id: number;
  venue_name: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  gps_coordinate: string | null;
  opening_time: string | null;
  closing_time: string | null;
  thumbnail: string;
}

interface FieldDetail {
  id: number;
  name: string;
  type: string;
  status: string;
  photo_url: string;
  venue: Venue;
  pricing_schemes: PricingScheme[];
}

export default function OwnerFieldDetail() {
  const [field, setField] = useState<FieldDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", status: "" });
  const [fieldPhoto, setFieldPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddPricing, setShowAddPricing] = useState(false);
  const [pricingForm, setPricingForm] = useState({ duration_minutes: "", price: "", description: "" });
  const [addingPricing, setAddingPricing] = useState(false);
  const [deletingPricingId, setDeletingPricingId] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const fieldId = params?.fieldId as string | undefined;

  useEffect(() => {
    const fetchFieldDetail = async () => {
      if (!fieldId) return;
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/owners/fields/${fieldId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        if (json?.status === "success") {
          setField(json.data);
          setForm({
            name: json.data.name || "",
            type: json.data.type || "",
            status: json.data.status || "",
          });
        } else {
          setError(json.message || "Gagal memuat detail lapangan");
        }
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(error);
        setError(error.message || "Terjadi kesalahan saat memuat detail");
      } finally {
        setLoading(false);
      }
    };
    fetchFieldDetail();
  }, [fieldId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file maksimal 1MB
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSizeInBytes) {
        alert("Ukuran file terlalu besar. Maksimal 1MB.");
        e.target.value = ""; // Reset input
        return;
      }
      setFieldPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (!fieldId) return;
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      setSaving(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("field_name", form.name);
      formData.append("sport_type", form.type.toLowerCase());
      formData.append("status", form.status);
      if (fieldPhoto) {
        formData.append("field_photo", fieldPhoto);
      }

      const res = await fetch(`${API_BASE_URL}/owners/fields/${fieldId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        setField(json.data);
        setForm({
          name: json.data.name || "",
          type: json.data.type || "",
          status: json.data.status || "",
        });
        setFieldPhoto(null);
        setPhotoPreview(null);
        setEditing(false);
        alert("Lapangan berhasil diperbarui!");
      } else {
        alert(json.message || "Gagal update");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus lapangan ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      if (!fieldId) return;
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/owners/fields/${fieldId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        router.push(`/owner/dashboard/venue/${id}`);
      } else {
        alert(json.message || "Gagal menghapus");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal menghapus");
    }
  };

  const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPricingForm({ ...pricingForm, [e.target.name]: e.target.value });
  };

  const handleAddPricing = async () => {
    if (!pricingForm.duration_minutes || !pricingForm.price) {
      alert("Durasi dan harga harus diisi!");
      return;
    }

    try {
      if (!fieldId) return;
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      setAddingPricing(true);

      const res = await fetch(`${API_BASE_URL}/owners/fields/${fieldId}/pricing`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          duration_minutes: parseInt(pricingForm.duration_minutes),
          price: parseInt(pricingForm.price),
          description: pricingForm.description,
        }),
      });

      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        const newScheme: PricingScheme = {
          id: json.data.id,
          duration_minutes: json.data.duration_minutes,
          price: json.data.price,
          raw_price: json.data.raw_price,
          description: json.data.description,
        };
        setField((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pricing_schemes: [...prev.pricing_schemes, newScheme],
          };
        });
        setPricingForm({ duration_minutes: "", price: "", description: "" });
        setShowAddPricing(false);
        alert("Skema harga berhasil ditambahkan!");
      } else {
        alert(json.message || "Gagal menambahkan skema harga");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal menambahkan skema harga");
    } finally {
      setAddingPricing(false);
    }
  };

  const handleDeletePricing = async (pricingId: number) => {
    if (!confirm("Hapus skema harga ini? Tindakan tidak dapat dibatalkan.")) return;

    try {
      if (!fieldId) return;
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      setDeletingPricingId(pricingId);

      const res = await fetch(`${API_BASE_URL}/owners/fields/${fieldId}/pricing/${pricingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        setField((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pricing_schemes: prev.pricing_schemes.filter((s) => s.id !== pricingId),
          };
        });
        alert("Skema harga berhasil dihapus!");
      } else {
        alert(json.message || "Gagal menghapus skema harga");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal menghapus skema harga");
    } finally {
      setDeletingPricingId(null);
    }
  };

  if (loading) return <div>Memuat detail lapangan...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!field) return <div>Tidak ada data</div>;

  const displayPhotoUrl = field.photo_url ? getStorageUrl(field.photo_url) : "https://placehold.co/600x400/0d47a1/ffffff?text=Field";
  const FIELD_PLACEHOLDER = "https://placehold.co/600x400/0d47a1/ffffff?text=Field";

  return (
    <section>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
        <span>← Kembali</span>
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#0d47a1]">{field.name}</h1>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
            {editing ? (
              <>
                <X size={14} />
                <span>Batal</span>
              </>
            ) : (
              <>
                <Pencil size={14} />
                <span>Edit</span>
              </>
            )}
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
            <Trash2 size={14} />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Column */}
        <div>
          <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPhotoUrl}
              alt={field.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FIELD_PLACEHOLDER;
              }}
            />
          </div>
        </div>

        {/* Information Column */}
        <div>
          {!editing ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tipe:</span> {field.type}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                <span className={`inline-block px-2 py-1 text-xs rounded ${field.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{field.status}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Venue:</span> {field.venue?.venue_name || "..."}
              </p>
              {field.venue?.address && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Alamat:</span> {field.venue.address}
                </p>
              )}
              {field.venue?.city && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Kota:</span> {field.venue.city}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lapangan</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Lapangan</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                >
                  <option value="">Pilih Tipe</option>
                  <option value="futsal">Futsal</option>
                  <option value="basket">Basket</option>
                  <option value="voli">Voli</option>
                  <option value="badminton">Badminton</option>
                  <option value="tenis">Tenis</option>
                  <option value="padel">Padel</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                >
                  <option value="AVAILABLE">Tersedia</option>
                  <option value="MAINTENANCE">Perawatan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto Lapangan (opsional, Max 1MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0d47a1] file:text-white hover:file:bg-[#083055] file:cursor-pointer cursor-pointer"
                />
                {photoPreview && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="preview" className="w-[300px] h-[160px] object-cover rounded-lg" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>{saving ? "Menyimpan..." : "Simpan"}</span>
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFieldPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <X size={16} />
                  <span>Batal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Schemes Section - Full Width */}
      {!editing && (
        <div className="mt-8 pt-8 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0d47a1]">Skema Harga</h2>
            <button onClick={() => setShowAddPricing(!showAddPricing)} className="inline-flex items-center gap-2 px-3 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] text-sm">
              {showAddPricing ? (
                <>
                  <X size={16} />
                  <span>Batal</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Tambah Harga</span>
                </>
              )}
            </button>
          </div>

          {/* Form Tambah Skema Harga */}
          {showAddPricing && (
            <div className="mb-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4 text-gray-900">Tambah Skema Harga Baru</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit) *</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={pricingForm.duration_minutes}
                    onChange={handlePricingChange}
                    placeholder="Contoh: 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    name="price"
                    value={pricingForm.price}
                    onChange={handlePricingChange}
                    placeholder="Contoh: 200000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
                  <textarea
                    name="description"
                    value={pricingForm.description}
                    onChange={handlePricingChange}
                    placeholder="Contoh: Harga untuk hari kerja"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPricing}
                    disabled={addingPricing}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    <span>{addingPricing ? "Menambahkan..." : "Simpan Harga"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPricing(false);
                      setPricingForm({ duration_minutes: "", price: "", description: "" });
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <X size={16} />
                    <span>Batal</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Schemes Grid */}
          {field.pricing_schemes && field.pricing_schemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {field.pricing_schemes.map((scheme) => (
                <div key={scheme.id} className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                  <button
                    onClick={() => handleDeletePricing(scheme.id)}
                    disabled={deletingPricingId === scheme.id}
                    className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-50"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-start justify-between mb-3 pr-8">
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Durasi</p>
                      <p className="text-2xl font-bold text-[#0d47a1]">
                        {scheme.duration_minutes}
                        <span className="text-sm font-normal text-gray-600"> menit</span>
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 pb-3 border-b border-blue-200">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Harga</p>
                    <p className="text-xl font-bold text-[#0d47a1]">{scheme.price}</p>
                  </div>

                  {scheme.description && (
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Keterangan</p>
                      <p className="text-sm text-gray-700">{scheme.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Belum ada skema harga. Tambahkan skema harga pertama Anda!</div>
          )}
        </div>
      )}
    </section>
  );
}
