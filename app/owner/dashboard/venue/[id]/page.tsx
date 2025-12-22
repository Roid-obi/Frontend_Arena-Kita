"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Pencil, Trash2, X, Save, PlusCircle, Eye } from "lucide-react";
import { API_BASE_URL, getStorageUrl } from "@/lib/api";
import LocationPicker from "@/components/LocationPicker";

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

interface Field {
  id: number;
  name: string;
  type: string;
  status: string;
  photoUrl: string | null;
}

export default function OwnerVenueDetail() {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [venuePhotos, setVenuePhotos] = useState<Array<{ id: number; photo_url: string }>>([]);
  const [form, setForm] = useState({ venue_name: "", address: "", city: "", description: "", gps_coordinate: "", opening_time: "", closing_time: "" });
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [fieldForm, setFieldForm] = useState({ field_name: "", sport_type: "" });
  const [fieldPhoto, setFieldPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [addingField, setAddingField] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState<number | null>(null);
  const [venuePhotoFile, setVenuePhotoFile] = useState<File | null>(null);
  const [venuePhotoPreview, setVenuePhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/owners/venues/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
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

  useEffect(() => {
    const fetchFields = async () => {
      if (!id) return;
      setFieldsLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/owners/venues/${id}/fields`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        if (json?.status === "success") {
          const mapped: Field[] = (json.data || []).map(
            (f: { id: number; field_name?: string; name?: string; sport_type?: string; type?: string; status?: string; field_photo_url?: string | null; photo_url?: string | null }) => ({
              id: f.id,
              name: f.field_name ?? f.name ?? "Tanpa Nama",
              type: f.sport_type ?? f.type ?? "-",
              status: f.status ?? "-",
              photoUrl: f.field_photo_url ?? f.photo_url ?? null,
            })
          );
          setFields(mapped);
        }
      } catch (e: unknown) {
        console.error("Error fetching fields:", e);
      } finally {
        setFieldsLoading(false);
      }
    };
    fetchFields();
  }, [id]);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!id) return;
      try {
        const token = Cookies.get("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/owners/venues/${id}/photos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const json = await res.json();
        if (json?.status === "success" && Array.isArray(json.data)) {
          const normalized = json.data.map((p: { id: number; url?: string; photo_url?: string }) => {
            const raw = p.url ?? p.photo_url ?? "";
            const full = getStorageUrl(raw);
            return { id: p.id, photo_url: full };
          });
          setVenuePhotos(normalized);
        }
      } catch (e) {
        console.warn("Failed fetching venue photos", e);
      }
    };
    fetchPhotos();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!id) return;
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      // Pastikan format jam operasional "HH:mm:ss"
      const opening_time = form.opening_time.length === 5 ? form.opening_time + ":00" : form.opening_time;
      const closing_time = form.closing_time.length === 5 ? form.closing_time + ":00" : form.closing_time;
      const payload = { ...form, opening_time, closing_time };
      const res = await fetch(`${API_BASE_URL}/owners/venues/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/owners/venues/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
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

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFieldForm({ ...fieldForm, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVenuePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVenuePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setVenuePhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadVenuePhoto = async () => {
    if (!venuePhotoFile) {
      alert("Pilih foto terlebih dahulu.");
      return;
    }
    try {
      if (!id) return;
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append("photo_url", venuePhotoFile);

      const res = await fetch(`${API_BASE_URL}/owners/venues/${id}/photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        const normalizedUrl = getStorageUrl(json.data?.url);
        const newPhoto = { id: json.data?.id ?? Date.now(), photo_url: normalizedUrl };
        setVenuePhotos((prev) => [...prev, newPhoto]);
        setVenuePhotoFile(null);
        setVenuePhotoPreview(null);
        alert("Foto venue berhasil ditambahkan!");
      } else {
        alert(json?.message || "Gagal menambahkan foto");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal menambahkan foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeleteVenuePhoto = async (photoId: number) => {
    if (!confirm("Hapus foto ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      if (!id) return;
      const token = Cookies.get("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
      setDeletingPhotoId(photoId);

      const res = await fetch(`${API_BASE_URL}/owners/venues/${id}/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      const json = await res.json();
      if (json?.status === "success") {
        setVenuePhotos((prev) => prev.filter((p) => p.id !== photoId));
        alert("Foto venue berhasil dihapus!");
      } else {
        alert(json?.message || "Gagal menghapus foto");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error);
      alert(error.message || "Gagal menghapus foto");
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleAddField = async () => {
    if (!fieldForm.field_name || !fieldForm.sport_type) {
      alert("Nama dan tipe lapangan harus diisi!");
      return;
    }

    const buildFormData = (includePhoto: boolean) => {
      const formData = new FormData();
      formData.append("field_name", fieldForm.field_name);
      formData.append("sport_type", fieldForm.sport_type.toLowerCase());
      formData.append("status", "AVAILABLE");
      if (includePhoto && fieldPhoto) {
        formData.append("field_photo", fieldPhoto);
      }
      return formData;
    };

    const attemptPost = async (includePhoto: boolean) => {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");
      const res = await fetch(`${API_BASE_URL}/owners/venues/${id}/fields`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: buildFormData(includePhoto),
      });
      const json = await res.json();
      return { res, json };
    };

    setAddingField(true);
    try {
      if (!id) return;

      const firstTry = await attemptPost(true);
      let success = firstTry.res.ok && firstTry.json?.status === "success";
      let payload = firstTry.json;

      // Jika gagal karena foto, coba ulang tanpa foto
      if (!success && fieldPhoto) {
        console.warn("Upload dengan foto gagal, mencoba tanpa foto...");
        const secondTry = await attemptPost(false);
        success = secondTry.res.ok && secondTry.json?.status === "success";
        payload = secondTry.json;
      }

      if (!success) {
        const msg = payload?.message || `Gagal menambahkan lapangan (status ${firstTry.res.status})`;
        throw new Error(msg);
      }

      // Map response data to Field and add to list
      const newFieldData = payload.data;
      const newField: Field = {
        id: newFieldData.id,
        name: newFieldData.name,
        type: newFieldData.type,
        status: newFieldData.status || "AVAILABLE",
        photoUrl: newFieldData.photo_url ? getStorageUrl(newFieldData.photo_url) : null,
      };
      setFields((prev) => [...prev, newField]);

      setFieldForm({ field_name: "", sport_type: "" });
      setFieldPhoto(null);
      setPhotoPreview(null);
      setShowAddField(false);
      alert("Lapangan berhasil ditambahkan!");
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error("handleAddField error:", error);
      alert(error.message || "Gagal menambahkan lapangan");
    } finally {
      setAddingField(false);
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    if (!confirm("Hapus lapangan ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      setDeletingFieldId(fieldId);
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
        setFields((prev) => prev.filter((f) => f.id !== fieldId));
        alert("Lapangan berhasil dihapus!");
      } else {
        alert(json?.message || "Gagal menghapus lapangan");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error("Delete field error:", error);
      alert(error.message || "Gagal menghapus lapangan");
    } finally {
      setDeletingFieldId(null);
    }
  };

  if (loading) return <div>Memuat detail...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!venue) return <div>Tidak ada data</div>;

  return (
    <section>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
        <span>← Kembali</span>
      </button>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#0d47a1]">{venue.venue_name}</h1>
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
            {(venuePhotos.length ? venuePhotos : (venue.venue_photo || []).map((p) => ({ id: p.id, photo_url: p.photo_url }))).map((p: { id: number; photo_url: string }) => {
              const photoUrl = getStorageUrl(p.photo_url);
              return (
                <div key={p.id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="photo" className="w-full h-40 object-cover rounded" />
                  <button
                    onClick={() => handleDeleteVenuePhoto(p.id)}
                    disabled={deletingPhotoId === p.id}
                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    title="Hapus foto"
                  >
                    {deletingPhotoId === p.id ? "..." : "Hapus"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Tambah Foto Venue</h3>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleVenuePhotoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
              />
              {venuePhotoPreview && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={venuePhotoPreview} alt="preview" className="w-full h-40 object-cover rounded" />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleUploadVenuePhoto}
                  disabled={uploadingPhoto || !venuePhotoFile}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>{uploadingPhoto ? "Mengunggah..." : "Unggah Foto"}</span>
                </button>
                <button
                  onClick={() => {
                    setVenuePhotoFile(null);
                    setVenuePhotoPreview(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <X size={16} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Venue</label>
            <input
              name="venue_name"
              value={form.venue_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
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
              <input
                name="city"
                value={form.city}
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buka</label>
              <input
                name="opening_time"
                type="time"
                value={form.opening_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tutup</label>
              <input
                name="closing_time"
                type="time"
                value={form.closing_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055]">
              <Save size={16} />
              <span>Simpan</span>
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <X size={16} />
              <span>Batal</span>
            </button>
          </div>
        </div>
      )}

      {/* Section Daftar Lapangan */}
      <div className="mt-8 pt-8 border-t">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0d47a1]">Daftar Lapangan</h2>
          <button onClick={() => setShowAddField(!showAddField)} className="inline-flex items-center gap-2 px-3 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] text-sm">
            {showAddField ? (
              <>
                <X size={16} />
                <span>Batal</span>
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                <span>Tambah Lapangan</span>
              </>
            )}
          </button>
        </div>

        {/* Form Tambah Lapangan */}
        {showAddField && (
          <div className="mb-4 p-4 bg-white rounded shadow-md">
            <h3 className="font-semibold mb-3">Tambah Lapangan Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lapangan *</label>
                <input
                  name="field_name"
                  value={fieldForm.field_name}
                  onChange={handleFieldChange}
                  placeholder="Contoh: Lapangan Futsal A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Lapangan *</label>
                <select
                  name="sport_type"
                  value={fieldForm.sport_type}
                  onChange={handleFieldChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto Lapangan (opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1] text-sm"
                />
                {photoPreview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Preview:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="preview" className="w-full h-40 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddField}
                  disabled={addingField}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>{addingField ? "Menambahkan..." : "Simpan Lapangan"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddField(false);
                    setFieldForm({ field_name: "", sport_type: "" });
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
          </div>
        )}

        {/* Daftar Lapangan */}
        {fieldsLoading ? (
          <div className="text-center py-4 text-gray-600">Memuat daftar lapangan...</div>
        ) : fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Belum ada lapangan. Tambahkan lapangan pertama Anda!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => {
              const FIELD_PLACEHOLDER = "https://placehold.co/300x200/0d47a1/ffffff?text=Field";
              const displayPhotoUrl = field.photoUrl ? getStorageUrl(field.photoUrl) : FIELD_PLACEHOLDER;

              return (
                <div key={field.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100">
                  <div className="w-full h-40 bg-gray-100 relative">
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
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded ml-2 shrink-0 ${field.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{field.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Tipe: {field.type}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/owner/dashboard/venue/${id}/field/${field.id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        <Eye size={14} /> Lihat
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        disabled={deletingFieldId === field.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} /> {deletingFieldId === field.id ? "..." : "Hapus"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
