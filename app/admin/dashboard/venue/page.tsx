import React from "react";
import venuesData from "@/data/dummy/venues.json";

export default function AdminVenue() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Kelola Semua Venue</h1>
      <p className="text-gray-600 mb-4">Kelola venue di platform (edit, hapus, lihat detail).</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venuesData.slice(0, 9).map((v) => (
          <div key={v.id} className="p-4 border rounded-md">
            <h3 className="font-semibold">{v.venue_name}</h3>
            <p className="text-sm text-gray-600">{v.city}</p>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 rounded bg-[#0d47a1] text-white text-sm">Edit</button>
              <button className="px-3 py-1 rounded bg-[#f97316] text-white text-sm">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
