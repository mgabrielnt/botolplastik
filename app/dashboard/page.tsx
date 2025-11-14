import { getDashboardData } from "@/lib/dashboardData";
import { KpiGrid } from "@/components/dashboard/KpiCard";
import { TransactionsLineChart } from "@/components/charts/TransactionsLineChart";
import { PerWarehouseStackedBar } from "@/components/charts/PerWarehouseStackedBar";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";
import { TopItemsBarChart } from "@/components/charts/TopItemsBarChart";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import DashboardFilters from "@/components/dashboard/DashboardFilters";

export const dynamic = "force-dynamic";

// ✅ di Next.js 16, searchParams di server component = Promise
type DashboardSearchParams = {
  range?: string;
  warehouse?: string;
};

type DashboardPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // ✅ WAJIB: tunggu promise-nya dulu
  const params = await searchParams;

  const rangeParam = params?.range ?? "30d";
  const warehouseParam = params?.warehouse ?? "all";

  const data = await getDashboardData({
    range: rangeParam,
    warehouseCode: warehouseParam
  });

  return (
    <div className="space-y-6">
      {/* Hero header ala SaaS dashboard */}
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-[11px] text-slate-50 px-3 py-1 shadow-sm">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live warehouse overview
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium">
              CSV · gudang_botol
            </span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard pergerakan & kondisi barang
            </h1>
           
          </div>
        </div>

        {/* 🔗 Filter sekarang benar-benar terhubung ke query */}
        <DashboardFilters
          currentRange={data.appliedRange}
          currentWarehouse={data.appliedWarehouse}
          warehouses={data.warehouses}
        />
      </section>

      {/* KPI grid */}
      <KpiGrid kpis={data.kpis} />

      {/* Chart row utama */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionsLineChart data={data.transactionsOverTime} />
        </div>
        <div className="xl:col-span-1">
          <PerWarehouseStackedBar data={data.perWarehouse} />
        </div>
      </section>

      {/* Chart row kedua */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <StatusDonutChart data={data.statusComposition} />
        </div>
        <div className="lg:col-span-3">
          <TopItemsBarChart data={data.topMovement} />
        </div>
      </section>

      {/* Recent transactions */}
      <RecentTransactionsTable rows={data.recentTransactions} />
    </div>
  );
}
