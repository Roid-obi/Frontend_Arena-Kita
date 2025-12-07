import React from "react";
import Navbar from "@/components/Navbar";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard - ArenaKita",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1a1a1a]">
      <Navbar />
      <AdminSidebar />
      <div className="md:ml-64">
        <div className="mx-auto px-4 md:px-8 py-6 md:py-8">
          <main className="w-full">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
