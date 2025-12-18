"use client";

import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { User, Mail, Phone, Calendar, Shield, Edit2, Camera, X, Save } from "lucide-react";
import Image from "next/image";
import { API_BASE_URL, getStorageUrl } from "@/lib/api";

interface ProfileData {
  id: number;
  full_name: string;
  email: string;
  email_verified_at: string | null;
  phone_number: string | null;
  profile_photo_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const getImageUrl = (url: string | null): string => {
  if (!url) return "";
  return getStorageUrl(url);
};

export default function DashboardAccount() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone_number: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();
      if (result.status === "success" && result.data) {
        setProfile(result.data);
        setEditForm({
          full_name: result.data.full_name,
          phone_number: result.data.phone_number || "",
        });
      } else {
        setError(result.message || "Gagal mengambil data profil");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Terjadi kesalahan saat mengambil data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      setError("");

      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan");
        return;
      }

      const formData = new FormData();
      formData.append("full_name", editForm.full_name);
      formData.append("phone_number", editForm.phone_number);

      if (selectedFile) {
        formData.append("profile_photo", selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success" && result.data) {
        setProfile(result.data);
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        alert("Profil berhasil diperbarui!");
      } else {
        setError(result.message || "Gagal memperbarui profil");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (profile) {
      setEditForm({
        full_name: profile.full_name,
        phone_number: profile.phone_number || "",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pengaturan Owner</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pengaturan Owner</h1>
        <div className="bg-red-50 text-red-700 rounded-lg p-6">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-1">Pengaturan Owner</h1>
          <p className="text-gray-600">Informasi akun owner dan pengaturan bisnis.</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] transition">
            <Edit2 size={18} />
            <span>Edit Profil</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {profile?.profile_photo_url || previewUrl ? (
              <Image src={previewUrl || getImageUrl(profile?.profile_photo_url || null) || ""} alt="Profile" width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-[#0d47a1] rounded-full flex items-center justify-center text-white text-2xl font-bold">{profile?.full_name?.charAt(0).toUpperCase() || "O"}</div>
            )}
            {isEditing && (
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-[#0d47a1] text-white rounded-full hover:bg-[#083055] transition">
                <Camera size={16} />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="text-[#0d47a1] mt-1" size={20} />
                <div className="flex-1">
                  <label className="text-sm text-gray-500 mb-1 block">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-[#0d47a1] mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{profile?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="text-[#0d47a1] mt-1" size={20} />
                <div className="flex-1">
                  <label className="text-sm text-gray-500 mb-1 block">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="text-[#0d47a1] mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Nama Lengkap</p>
                  <p className="font-medium text-gray-800">{profile?.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-[#0d47a1] mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{profile?.email}</p>
                  {profile?.email_verified_at && <p className="text-xs text-green-600 mt-1">✓ Email terverifikasi</p>}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="text-[#0d47a1] mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Nomor Telepon</p>
                  <p className="font-medium text-gray-800">{profile?.phone_number || "Belum diatur"}</p>
                </div>
              </div>
            </>
          )}

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="text-[#0d47a1] mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Bergabung Sejak</p>
              <p className="font-medium text-gray-800">{profile?.created_at ? formatDate(profile.created_at) : "-"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="text-[#0d47a1] mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">ID Owner</p>
              <p className="font-medium text-gray-800">#{profile?.id}</p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
            >
              <X size={18} />
              <span>Batal</span>
            </button>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <button className="w-full p-4 hover:bg-gray-50 rounded-lg transition text-left">
            <h3 className="font-semibold mb-2 text-[#0d47a1] flex items-center gap-2">
              <Shield size={20} />
              Keamanan
            </h3>
            <p className="text-sm text-gray-600">Ubah kata sandi dan pengaturan keamanan</p>
          </button>
        </div>
      )}
    </section>
  );
}
