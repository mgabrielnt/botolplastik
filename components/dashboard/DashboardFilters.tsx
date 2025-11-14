"use client";

import { useRouter, useSearchParams } from "next/navigation";

type WarehouseOption = {
  code: string;
  name: string;
};

type Props = {
  currentRange: string;
  currentWarehouse: string;
  warehouses: WarehouseOption[];
};

const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "30d", label: "30 hari terakhir" },
  { value: "7d", label: "7 hari" },
  { value: "today", label: "Hari ini" },
  { value: "all", label: "Semua waktu" }
];

export default function DashboardFilters({
  currentRange,
  currentWarehouse,
  warehouses
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = (updates: { range?: string; warehouse?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.range) {
      params.set("range", updates.range);
    }
    if (updates.warehouse) {
      params.set("warehouse", updates.warehouse);
    }

    const qs = params.toString();
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between xl:justify-end">
      <div className="inline-flex items-center rounded-full bg-white/80 px-1 py-1 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateQuery({ range: opt.value })}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
              currentRange === opt.value
                ? "bg-slate-900 text-slate-50 shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={currentWarehouse}
        onChange={(e) => updateQuery({ warehouse: e.target.value })}
        className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        <option value="all">Semua gudang</option>
        {warehouses.map((w) => (
          <option key={w.code} value={w.code}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}
