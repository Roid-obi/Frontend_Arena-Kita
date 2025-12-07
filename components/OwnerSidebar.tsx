"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, ClipboardList, Grid, Settings, Menu, X } from "lucide-react";

export default function OwnerSidebar() {
  const [open, setOpen] = useState(false);

  const menu = [
    { href: "/owner/dashboard", label: "Info Umum", icon: User },
    { href: "/owner/dashboard/pesanan", label: "Pesanan Masuk", icon: ClipboardList },
    { href: "/owner/dashboard/venue", label: "Kelola Venue", icon: Grid },
    { href: "/owner/dashboard/account", label: "Akun", icon: Settings },
  ];

  return (
    <>
      {/* Mobile top trigger */}
      <div className="md:hidden flex items-center justify-between bg-white border-b px-4 py-2">
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md text-[#0d47a1]">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="text-lg font-semibold text-[#0d47a1]">Owner Dashboard</div>
      </div>

      {/* Sidebar overlay for mobile (full width) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full bg-white p-4 overflow-auto">
            <nav className="space-y-2">
              {menu.map((m) => {
                const Icon = m.icon;
                return (
                  <Link key={m.href} href={m.href} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 text-[#0d47a1] font-medium" onClick={() => setOpen(false)}>
                    <Icon size={18} />
                    <span>{m.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:sticky md:top-0 md:bg-white md:border-r md:px-4 md:py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0d47a1]">Owner Dashboard</h2>
          <p className="text-sm text-gray-600">Kelola venue dan pesananmu</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.href} href={m.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800">
                <Icon size={18} className="text-[#0d47a1]" />
                <span className="font-medium">{m.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          <Link href="/" className="block text-sm px-3 py-2 rounded-md bg-[#f97316] text-white text-center hover:opacity-95">
            Kembali ke Beranda
          </Link>
        </div>
      </aside>
    </>
  );
}
