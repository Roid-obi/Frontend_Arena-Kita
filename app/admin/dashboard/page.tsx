import React from "react";
import { Users, Building2, Clock3 } from "lucide-react";

export default function AdminDashboardHome() {
  return (
    <section>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d47a1]">Dashboard Admin</h1>
        <p className="text-gray-600">Ringkasan sistem, statistik, dan pemberitahuan.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value="1200" highlight="Placeholder" icon={<Users className="text-[#0d47a1]" />} />
        <StatCard title="Total Venues" value="230" highlight="Placeholder" icon={<Building2 className="text-emerald-600" />} />
        <StatCard title="Pending Orders" value="12" highlight="Placeholder" icon={<Clock3 className="text-amber-500" />} />
      </div>
    </section>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  highlight: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, highlight, icon }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white shadow-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold text-[#0d47a1]">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-blue-50 border border-blue-100">{icon}</div>
      </div>
      <p className="text-xs text-gray-500">{highlight}</p>
    </div>
  );
}
