import React from "react";

export default function AdminDashboardHome() {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1] mb-3">Info Umum Admin</h1>
      <p className="text-gray-600 mb-4">Ringkasan sistem, statistik, dan pemberitahuan.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold">Total Users</h3>
          <p className="text-sm text-gray-600">Placeholder: 1200</p>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="font-semibold">Total Venues</h3>
          <p className="text-sm text-gray-600">Placeholder: 230</p>
        </div>

        <div className="p-4 border rounded-md">
          <h3 className="font-semibold">Pending Orders</h3>
          <p className="text-sm text-gray-600">Placeholder: 12</p>
        </div>
      </div>
    </section>
  );
}
