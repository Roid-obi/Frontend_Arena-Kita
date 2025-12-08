"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ClipboardList, Grid, Settings, Menu, X } from "lucide-react";

export default function OwnerSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menu = [
    { href: "/owner/dashboard", label: "Info Umum", icon: User },
    { href: "/owner/dashboard/pesanan", label: "Pesanan Masuk", icon: ClipboardList },
    { href: "/owner/dashboard/venue", label: "Kelola Venue", icon: Grid },
    { href: "/owner/dashboard/fields", label: "Kelola Lapangan", icon: Grid },
    { href: "/owner/dashboard/account", label: "Akun", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/owner/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile top trigger */}
      <div className="md:hidden flex items-center justify-between bg-white shadow-md px-4 py-3">
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md text-[#0d47a1]">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="text-lg font-semibold text-[#0d47a1]">Owner Dashboard</div>
      </div>

      {/* Sidebar overlay for mobile (full width) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full bg-white p-4 overflow-auto mt-[57vh]">
            <nav className="space-y-2">
              {menu.map((m) => {
                const Icon = m.icon;
                const active = isActive(m.href);
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md font-medium ${active ? "bg-[#0d47a1] text-white" : "hover:bg-gray-100 text-[#0d47a1]"}`}
                    onClick={() => setOpen(false)}
                  >
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
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:fixed md:left-0 md:top-0 md:bg-white md:shadow-lg md:px-4 md:py-6 md:overflow-y-auto">
        <div className="mb-6 mt-15">
          <h2 className="text-xl font-bold text-[#0d47a1]">Owner Dashboard</h2>
          <p className="text-sm text-gray-600">Kelola venue dan pesananmu</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = isActive(m.href);
            return (
              <Link key={m.href} href={m.href} className={`flex items-center gap-3 px-3 py-2 rounded-md ${active ? "bg-[#0d47a1] text-white" : "hover:bg-gray-100 text-gray-800"}`}>
                <Icon size={18} className={active ? "text-white" : "text-[#0d47a1]"} />
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
