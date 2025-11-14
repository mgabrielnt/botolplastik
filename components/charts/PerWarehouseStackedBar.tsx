"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import type { PerWarehouseBar } from "@/lib/dashboardData";

type Props = {
  data: PerWarehouseBar[];
};

const COLORS = {
  restock: "#22c55e",     // hijau terang
  out: "#fb7185",         // merah muda untuk keluar
  transferIn: "#38bdf8",  // biru untuk pindah masuk
  transferOut: "#a855f7"  // ungu untuk pindah keluar
};

export function PerWarehouseStackedBar({ data }: Props) {
  return (
    <div className="card h-[340px]">
      <div className="card-inner h-full flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Perbandingan pergerakan per gudang
            </h2>
            <p className="text-xs text-slate-500">
              Total masuk, keluar, dan pindah antar gudang berdasarkan transaksi CSV.
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -18, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="warehouse"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickMargin={4}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#e2e8f0",
                  fontSize: 11
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 8 }} />
              <Bar
                dataKey="restock"
                stackId="a"
                name="Masuk"
                fill={COLORS.restock}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="out"
                stackId="a"
                name="Keluar"
                fill={COLORS.out}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="transferIn"
                stackId="b"
                name="Pindah Masuk"
                fill={COLORS.transferIn}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="transferOut"
                stackId="b"
                name="Pindah Keluar"
                fill={COLORS.transferOut}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
