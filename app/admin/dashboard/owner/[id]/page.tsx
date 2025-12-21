"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

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
  total_venues: number;
  created_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: OwnerDetail;
}

export default function OwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [owner, setOwner] = useState<OwnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
          throw new Error(`Gagal mengambil detail owner (${res.status})`);
        }

        const json: ApiResponse = await res.json();
        if (json.status === "success" && json.data) {
          setOwner(json.data);
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

  const handleDelete = async () => {
    if (!owner) return;
    try {
      setDeleteLoading(true);
      setDeleteError("");
      const token = Cookies.get("token");
      if (!token) {
        setDeleteError("Token tidak ditemukan. Silakan login kembali.");
        setDeleteLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/admin/owners/${owner.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Even when API returns error status in body, HTTP status may be 200/4xx
      const json = await res.json().catch(() => null);
      if (res.ok && json && json.status === "success") {
        setShowDeleteModal(false);
        router.push("/admin/dashboard/owner");
      } else {
        const msg = (json && json.message) || `Gagal menghapus owner (${res.status})`;
        setDeleteError(msg);
      }
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0d47a1]" />
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="p-6">
        {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
        <Link href="/admin/dashboard/owner" className="text-[#0d47a1] hover:underline">
          &larr; Kembali ke daftar owner
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#0d47a1] hover:underline text-sm font-medium">
            &larr; Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Detail Owner</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/dashboard/owner/${owner.id}/edit`} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] text-sm">
            <Pencil size={16} />
            <span>Edit Owner</span>
          </Link>
          <button
            onClick={() => {
              setDeleteError("");
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm"
          >
            <Trash2 size={16} />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-gray-500">ID Owner</p>
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Hapus Owner</h2>
                    <p className="text-gray-600 mb-4">
                      Apakah Anda yakin ingin menghapus owner <span className="font-semibold">{owner.full_name}</span>? Jika owner memiliki venue aktif, penghapusan akan ditolak.
                    </p>
                    {deleteError && <div className="mb-3 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{deleteError}</div>}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        disabled={deleteLoading}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deleteLoading ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xl font-semibold text-gray-900">#{owner.id}</p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">Total Venue: {owner.total_venues}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nama Lengkap</p>
              <p className="text-lg font-semibold text-gray-900">{owner.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base text-gray-800">{owner.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">No. Telepon</p>
              <p className="text-base text-gray-800">{owner.phone_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Terdaftar</p>
              <p className="text-base text-gray-800">{owner.created_at}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Detail Bank</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Bank</p>
              <p className="text-base text-gray-800 font-medium">{owner.bank_details.bank_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">No. Rekening</p>
              <p className="text-base text-gray-800">{owner.bank_details.account_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Atas Nama</p>
              <p className="text-base text-gray-800">{owner.bank_details.account_name}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
