"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from "recharts";
import type { StatusCompositionSlice } from "@/lib/dashboardData";

const STATUS_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Hilang: "#ef4444",
  Rusak: "#eab308",
  Ketemu: "#3b82f6"
};

type Props = {
  data: StatusCompositionSlice[];
};

export function StatusDonutChart({ data }: Props) {
  const total = data.reduce((sum, s) => sum + s.count, 0);
  const chartData = data.map((s) => ({
    ...s,
    label: `${s.status} (${((s.count / (total || 1)) * 100).toFixed(1)}%)`
  }));

  return (
    <div className="card h-[320px]">
      <div className="card-inner h-full flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Komposisi status barang
            </h2>
            <p className="text-xs text-slate-500">
              Perbandingan barang normal, hilang, rusak, dan yang sudah ketemu.
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#e2e8f0",
                  fontSize: 11
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
