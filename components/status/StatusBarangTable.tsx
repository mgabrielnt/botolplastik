"use client";

import { useMemo, useState } from "react";
import type { StatusRow } from "@/lib/statusData";

type Props = {
  initialRows: StatusRow[];
};

const STATUS_LABEL: Record<StatusRow["status"], string> = {
  NORMAL: "Normal",
  HILANG: "Hilang",
  RUSAK: "Rusak",
  KETEMU: "Ketemu"
};

export default function StatusBarangTable({ initialRows }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusRow["status"] | "ALL">("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "HILANG" | "RUSAK">("ALL");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("ALL");

  const warehouses = useMemo(
    () => Array.from(new Set(initialRows.map((r) => r.warehouseName))),
    [initialRows]
  );

  const filtered = useMemo(() => {
    return initialRows.filter((row) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !row.itemCode.toLowerCase().includes(q) &&
          !row.itemName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (statusFilter !== "ALL" && row.status !== statusFilter) {
        return false;
      }

      if (warehouseFilter !== "ALL" && row.warehouseName !== warehouseFilter) {
        return false;
      }

      if (stockFilter === "LOW" && row.currentStock > 20) {
        return false;
      }
      if (stockFilter === "HILANG" && row.totalLost <= row.totalFound) {
        return false;
      }
      if (stockFilter === "RUSAK" && row.totalDamaged <= 0) {
        return false;
      }

      return true;
    });
  }, [initialRows, query, statusFilter, stockFilter, warehouseFilter]);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-inner space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                Status stok per barang
              </h1>
              <p className="text-xs text-slate-500">
                Monitor stok menipis, barang bermasalah, dan pergerakan per gudang.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Cari kode / nama barang..."
                className="w-52 rounded-full border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs bg-white"
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
              >
                <option value="ALL">Semua gudang</option>
                {warehouses.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <select
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs bg-white"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusRow["status"] | "ALL")
                }
              >
                <option value="ALL">Semua status</option>
                <option value="NORMAL">Normal</option>
                <option value="HILANG">Hilang</option>
                <option value="RUSAK">Rusak</option>
                <option value="KETEMU">Ketemu</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStockFilter("ALL")}
              className={`rounded-full px-3 py-1 text-[11px] border ${
                stockFilter === "ALL"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("LOW")}
              className={`rounded-full px-3 py-1 text-[11px] border ${
                stockFilter === "LOW"
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-amber-200 bg-white text-amber-700"
              }`}
            >
              Stok menipis
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("HILANG")}
              className={`rounded-full px-3 py-1 text-[11px] border ${
                stockFilter === "HILANG"
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-red-200 bg-white text-red-700"
              }`}
            >
              Banyak hilang
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("RUSAK")}
              className={`rounded-full px-3 py-1 text-[11px] border ${
                stockFilter === "RUSAK"
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-orange-200 bg-white text-orange-700"
              }`}
            >
              Banyak rusak
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-inner overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-500">
                <th className="py-2 pr-4 text-left">Kode</th>
                <th className="py-2 pr-4 text-left">Nama barang</th>
                <th className="py-2 pr-4 text-left">Gudang</th>
                <th className="py-2 pr-4 text-right">Stok</th>
                <th className="py-2 pr-4 text-right">Masuk</th>
                <th className="py-2 pr-4 text-right">Keluar</th>
                <th className="py-2 pr-4 text-right">Hilang</th>
                <th className="py-2 pr-4 text-right">Rusak</th>
                <th className="py-2 pr-0 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isLow = row.currentStock <= 20;
                const hasIssue =
                  row.totalLost > row.totalFound || row.totalDamaged > 0;

                return (
                  <tr
                    key={`${row.itemId}-${row.warehouseId}`}
                    className={`border-b border-slate-50 last:border-0 ${
                      hasIssue ? "bg-red-50/40" : isLow ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="py-2 pr-4 font-mono text-xs">
                      {row.itemCode}
                    </td>
                    <td className="py-2 pr-4">{row.itemName}</td>
                    <td className="py-2 pr-4">{row.warehouseName}</td>
                    <td className="py-2 pr-4 text-right font-semibold">
                      {row.currentStock.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {row.totalIn.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {row.totalOut.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {row.totalLost.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {row.totalDamaged.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 pr-0">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          row.status === "NORMAL"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : row.status === "HILANG"
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : row.status === "RUSAK"
                            ? "bg-orange-50 text-orange-700 border border-orange-100"
                            : "bg-sky-50 text-sky-700 border border-sky-100"
                        }`}
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-6 text-center text-xs text-slate-500"
                  >
                    Tidak ada data yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
