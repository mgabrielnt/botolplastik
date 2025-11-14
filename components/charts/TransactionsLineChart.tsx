"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import type { TransactionsOverTimePoint } from "@/lib/dashboardData";

type Props = {
  data: TransactionsOverTimePoint[];
};

const COLORS = {
  restock: "#0f766e", // hijau teal untuk barang masuk
  out: "#e11d48",     // merah untuk barang keluar / penjualan
  transfer: "#6366f1" // indigo untuk pindah gudang
};

export function TransactionsLineChart({ data }: Props) {
  return (
    <div className="card h-[340px]">
      <div className="card-inner h-full flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Pergerakan barang harian
            </h2>
            <p className="text-xs text-slate-500">
              Tren restock, penjualan, dan pindah gudang per tanggal 
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -18, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
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
              <Legend
                wrapperStyle={{ paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="restock"
                name="Masuk (restock)"
                dot={false}
                stroke={COLORS.restock}
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="out"
                name="Keluar (penjualan)"
                dot={false}
                stroke={COLORS.out}
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="transfer"
                name="Pindah gudang"
                dot={false}
                stroke={COLORS.transfer}
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
