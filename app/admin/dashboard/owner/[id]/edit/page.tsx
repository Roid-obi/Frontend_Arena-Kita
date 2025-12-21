"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api";

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface OwnerDetail {
  id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  bank_details: BankDetails;
  total_venues?: number;
  created_at: string;
}

interface UpdateOwnerResponse {
  status: string;
  message: string;
  data: OwnerDetail;
}

export default function EditOwnerPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        setLoading(true);
        setError("");
        const token = Cookies.get("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/admin/owners/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Gagal mengambil detail owner");
        }

        const json: UpdateOwnerResponse = await res.json();
        if (json.status === "success" && json.data) {
          const o = json.data;
          setFullName(o.full_name || "");
          setEmail(o.email || "");
          setPhoneNumber(o.phone_number || "");
          setBankName(o.bank_details?.bank_name || "");
          setAccountNumber(o.bank_details?.account_number || "");
          setAccountName(o.bank_details?.account_name || "");
        } else {
          throw new Error(json.message || "Gagal memuat detail owner");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOwner();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName || !email || !phoneNumber || !bankName || !accountNumber || !accountName) {
      setError("Lengkapi semua field terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);
      const token = Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/admin/owners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fullName,
          email,
          ...(password && { password }),
          phone: phoneNumber,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Gagal memperbarui owner");
      }

      const json: UpdateOwnerResponse = await res.json();
      if (json.status === "success" && json.data) {
        setSuccess(json.message || "Data owner berhasil diperbarui.");
        router.push(`/admin/dashboard/owner/${json.data.id}`);
      } else {
        throw new Error(json.message || "Gagal memperbarui owner");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0d47a1]" />
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto p-4 md:p-6">
      <Link href={`/admin/dashboard/owner/${id}`} className="text-[#0d47a1] hover:underline text-sm font-medium mb-3 inline-block">
        &larr; Kembali
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-6">Edit Owner</h1>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Nama Lengkap
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              placeholder="Nama pemilik"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              placeholder="email@owner.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Password (Kosongkan jika tidak ingin mengubah)
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              placeholder="Minimal 8 karakter"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            No. Telepon
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              placeholder="08xxxxxxxxxx"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Bank
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              placeholder="BCA / BNI / BRI"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            No. Rekening
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              placeholder="1234567890"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1 text-sm text-gray-700">
            Atas Nama
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d47a1]"
              placeholder="Nama pemilik rekening"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0d47a1] text-white rounded-lg text-sm font-medium hover:bg-[#083055] disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link href={`/admin/dashboard/owner/${id}`} className="text-sm text-gray-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>
    </section>
  );
}
