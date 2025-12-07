import React from "react";
import Navbar from "@/components/Navbar";
import OwnerSidebar from "@/components/OwnerSidebar";

export const metadata = {
  title: "Owner Dashboard - ArenaKita",
};

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1a1a1a]">
      <Navbar />
      <div className="mx-auto px-4 md:px-8 lg:px-[150px] py-6 md:py-8">
        <div className="flex">
          {/* Sidebar */}
          <OwnerSidebar />

          {/* Main content */}
          <main className="flex-1 md:pl-6 lg:pl-8">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
