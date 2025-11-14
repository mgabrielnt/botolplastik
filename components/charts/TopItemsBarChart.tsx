"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import type { TopItemMovementBar } from "@/lib/dashboardData";

type Props = {
  data: TopItemMovementBar[];
};

const BAR_COLOR = "#0f766e";

export function TopItemsBarChart({ data }: Props) {
  return (
    <div className="card h-[320px]">
      <div className="card-inner h-full flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Top pergerakan barang
            </h2>
            <p className="text-xs text-slate-500">
              Barang dengan total pergerakan (masuk + keluar + pindah) tertinggi.
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -18, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="itemCode"
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
              <Bar
                dataKey="movement"
                name="Total pergerakan"
                fill={BAR_COLOR}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
