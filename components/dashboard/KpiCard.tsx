import type { DashboardKpi } from "@/lib/dashboardData";

type Props = {
  kpi: DashboardKpi;
  index: number;
};

const accentGradients = [
  "from-sky-500/50 via-sky-500/0 to-transparent",
  "from-emerald-500/50 via-emerald-500/0 to-transparent",
  "from-violet-500/50 via-violet-500/0 to-transparent",
  "from-amber-500/60 via-amber-500/0 to-transparent",
  "from-rose-500/55 via-rose-500/0 to-transparent",
  "from-slate-900/60 via-slate-900/0 to-transparent"
];

export function KpiCard({ kpi, index }: Props) {
  const accent = accentGradients[index % accentGradients.length];

  const isPercentage = typeof kpi.value === "string" && kpi.value.endsWith("%");

  return (
    <div className="card h-full">
      {/* Garis aksen tipis di atas card */}
      <div
        className={`pointer-events-none absolute inset-x-0 -top-px h-[3px] bg-gradient-to-r ${accent}`}
      />
      <div className="card-inner flex h-full flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {kpi.label}
          </p>
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-100/80">
            Realtime
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {typeof kpi.value === "number"
              ? kpi.value.toLocaleString("id-ID")
              : kpi.value}
          </p>
          {isPercentage && (
            <span className="text-[11px] font-medium text-emerald-600">
              ▲ stabil
            </span>
          )}
        </div>

        {kpi.helper && (
          <p className="text-[11px] leading-relaxed text-slate-500">
            {kpi.helper}
          </p>
        )}

        {/* Chip kecil sebagai hint insight */}
        <div className="mt-auto flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-medium text-slate-50 shadow-sm">
            • Data dari transaksi gudang
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            • Terkait data gudang_botol
          </span>
        </div>
      </div>
    </div>
  );
}

type GridProps = {
  kpis: DashboardKpi[];
};

export function KpiGrid({ kpis }: GridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <KpiCard key={kpi.label} kpi={kpi} index={index} />
      ))}
    </div>
  );
}
