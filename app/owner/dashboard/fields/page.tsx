"use client";

import React, { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { PlusCircle, Pencil, Power, RefreshCw } from "lucide-react";

interface FieldItem {
  id: number;
  name: string;
  type: string;
  status: "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE";
  photo_url: string | null;
  venue_name: string;
}

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Field+Photo";

// Dummy seed until API ready
const dummyFields: FieldItem[] = [
  { id: 1, name: "Lapangan 1", type: "Futsal", status: "AVAILABLE", photo_url: null, venue_name: "Arena Futsal A" },
  { id: 2, name: "Court Utama", type: "Badminton", status: "MAINTENANCE", photo_url: "https://via.placeholder.com/400x300?text=Badminton", venue_name: "GOR Serbaguna" },
  { id: 3, name: "Pitch 2", type: "Sepak Bola", status: "AVAILABLE", photo_url: "https://via.placeholder.com/400x300?text=Soccer", venue_name: "Soccer Hub" },
  { id: 4, name: "Hall 3", type: "Basket", status: "UNAVAILABLE", photo_url: null, venue_name: "Basket Center" },
];

export default function OwnerFieldsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return dummyFields.filter((f) => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q) || f.venue_name.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage);

  const getStatusBadge = (status: FieldItem["status"]) => {
    if (status === "AVAILABLE") return "bg-green-100 text-green-800";
    if (status === "MAINTENANCE") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <section>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Kelola Lapangan</h1>
        <p className="text-gray-600">Daftar lapangan per venue. API belum tersedia, menggunakan data dummy.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="w-full md:w-64">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            placeholder="Cari lapangan/venue..."
          />
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-[#0d47a1] text-white rounded-lg hover:bg-[#083055] text-sm">
            <PlusCircle size={16} />
            <span>Tambah Lapangan</span>
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {current.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">Belum ada lapangan.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {current.map((field) => {
            const img = field.photo_url || PLACEHOLDER_IMG;
            return (
              <div key={field.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-100">
                <div className="w-full h-40 bg-gray-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={field.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                    }}
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(field.status)}`}>{field.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">Tipe: {field.type}</p>
                  <p className="text-xs text-gray-500">Venue: {field.venue_name}</p>
                  <div className="flex gap-2 pt-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">
                      <Power size={14} /> Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > itemsPerPage && (
        <div className="mt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </section>
  );
}
