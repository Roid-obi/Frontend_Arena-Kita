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

interface Field {
  id: number;
  name: string;
  type: string;
  status: string;
  photo_url: string;
}

export default function OwnerVenueDetail() {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ venue_name: "", address: "", city: "", description: "", gps_coordinate: "", opening_time: "", closing_time: "" });
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [fieldForm, setFieldForm] = useState({ name: "", type: "" });
  const [fieldPhoto, setFieldPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [addingField, setAddingField] = useState(false);
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

  useEffect(() => {
    const fetchFields = async () => {
      if (!id) return;
      setFieldsLoading(true);
      try {
        const res = await fetch(`/api/proxy/owners/venues/${id}/fields`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        if (json?.status === "success") {
          setFields(json.data || []);
        }
      } catch (e: unknown) {
        console.error("Error fetching fields:", e);
      } finally {
        setFieldsLoading(false);
      }
    };
    fetchFields();
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

  const handleAddField = async () => {
    if (!fieldForm.name || !fieldForm.type) {
      alert("Nama dan tipe lapangan harus diisi!");
      return;
    }

    setAddingField(true);
    try {
      if (!id) return;

      // Gunakan FormData untuk upload file
      const formData = new FormData();
      formData.append("name", fieldForm.name);
      formData.append("type", fieldForm.type);
      if (fieldPhoto) {
        // Coba berbagai nama field untuk file
        formData.append("photo", fieldPhoto);
        formData.append("field_photo", fieldPhoto);
      }

      // Log detail FormData
      console.log("=== Frontend FormData ===");
      console.log("name:", fieldForm.name);
      console.log("type:", fieldForm.type);
      console.log("photo:", fieldPhoto ? `${fieldPhoto.name} (${fieldPhoto.type}, ${fieldPhoto.size} bytes)` : "none");

      const res = await fetch(`/api/proxy/owners/venues/${id}/fields`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      console.log("=== Response ===");
      console.log("Status:", res.status);
      console.log("JSON:", json);

      if (!res.ok) {
        console.error("Error response:", json);
        // Menampilkan detail error dari backend
        const errorMsg = json.details || json.message || `Add field failed: ${res.status}`;
        throw new Error(errorMsg);
      }

      if (json?.status === "success") {
        // Refresh daftar fields
        const fieldsRes = await fetch(`/api/proxy/owners/venues/${id}/fields`);
        const fieldsJson = await fieldsRes.json();
        if (fieldsJson?.status === "success") {
          setFields(fieldsJson.data || []);
        }
        setFieldForm({ name: "", type: "" });
        setFieldPhoto(null);
        setPhotoPreview(null);
        setShowAddField(false);
        alert("Lapangan berhasil ditambahkan!");
      } else {
        alert(json.message || "Gagal menambahkan lapangan");
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error("handleAddField error:", error);
      alert(error.message || "Gagal menambahkan lapangan");
    } finally {
      setAddingField(false);
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

      {/* Section Daftar Lapangan */}
      <div className="mt-8 pt-8 border-t">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0d47a1]">Daftar Lapangan</h2>
          <button onClick={() => setShowAddField(!showAddField)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {showAddField ? "Batal" : "Tambah Lapangan"}
          </button>
        </div>

        {/* Form Tambah Lapangan */}
        {showAddField && (
          <div className="mb-4 p-4 bg-white rounded shadow-md">
            <h3 className="font-semibold mb-3">Tambah Lapangan Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lapangan *</label>
                <input name="name" value={fieldForm.name} onChange={handleFieldChange} placeholder="Contoh: Lapangan A" className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Lapangan *</label>
                <select name="type" value={fieldForm.type} onChange={handleFieldChange} className="w-full border px-3 py-2 rounded">
                  <option value="">Pilih Tipe</option>
                  <option value="Futsal">Futsal</option>
                  <option value="Basket">Basket</option>
                  <option value="Voli">Voli</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Tenis">Tenis</option>
                  <option value="Padel">Padel</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foto Lapangan (opsional)</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full border px-3 py-2 rounded" />
                {photoPreview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Preview:</p>
                    <img src={photoPreview} alt="preview" className="w-full h-40 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddField} disabled={addingField} className="px-4 py-2 bg-[#0d47a1] text-white rounded hover:bg-blue-800 disabled:bg-gray-400">
                  {addingField ? "Menambahkan..." : "Simpan Lapangan"}
                </button>
                <button
                  onClick={() => {
                    setShowAddField(false);
                    setFieldForm({ name: "", type: "" });
                    setFieldPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Batal
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
              // Konversi photo_url menjadi URL storage yang benar
              let displayPhotoUrl = field.photo_url;
              if (field.photo_url && !field.photo_url.startsWith("http")) {
                displayPhotoUrl = `https://dev.api.arenakita.my.id/storage/field_photo/${field.photo_url}`;
              }

              return (
                <div key={field.id} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  {displayPhotoUrl ? (
                    <img
                      src={displayPhotoUrl}
                      alt={field.name}
                      className="w-full h-40 object-cover rounded mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-500">Tidak ada foto</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-1">{field.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Tipe: {field.type}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded ${field.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{field.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
