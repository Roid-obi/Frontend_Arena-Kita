"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

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

export default function OwnerAccount() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await fetch("https://dev.api.arenakita.my.id/api/v1/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await response.json();
        if (result.status === "success" && result.data) {
          setProfile(result.data);
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

    fetchProfile();
  }, []);

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

  if (error) {
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
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Pengaturan Owner</h1>
      <p className="text-gray-600 mb-6">Informasi akun owner dan pengaturan bisnis.</p>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-[#0d47a1] rounded-full flex items-center justify-center text-white text-2xl font-bold">{profile?.full_name?.charAt(0).toUpperCase() || "O"}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition text-left">
          <h3 className="font-semibold mb-2 text-[#0d47a1]">Informasi Bisnis</h3>
          <p className="text-sm text-gray-600">Edit nama bisnis, alamat, dan kontak</p>
        </button>

        <button className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition text-left">
          <h3 className="font-semibold mb-2 text-[#0d47a1]">Keamanan & Akun</h3>
          <p className="text-sm text-gray-600">Ubah password dan pengaturan keamanan</p>
        </button>
      </div>
    </section>
  );
}
