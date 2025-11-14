import type { RecentTransactionRow } from "@/lib/dashboardData";

type Props = {
  rows: RecentTransactionRow[];
};

export function RecentTransactionsTable({ rows }: Props) {
  return (
    <div className="card">
      <div className="card-inner space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            10 transaksi terbaru
          </h2>
          <p className="text-xs text-slate-500">
            Snapshot aktivitas gudang paling akhir
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <th className="py-2 pr-4 text-left">Tanggal</th>
                <th className="py-2 pr-4 text-left">Jenis</th>
                <th className="py-2 pr-4 text-left">Barang</th>
                <th className="py-2 pr-4 text-right">Qty</th>
                <th className="py-2 pr-4 text-left">Gudang Asal</th>
                <th className="py-2 pr-4 text-left">Gudang Tujuan</th>
                <th className="py-2 pr-0 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-4">{row.date}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{row.item}</td>
                  <td className="py-2 pr-4 text-right">{row.quantity.toLocaleString("id-ID")}</td>
                  <td className="py-2 pr-4">{row.warehouseFrom ?? "—"}</td>
                  <td className="py-2 pr-4">{row.warehouseTo ?? "—"}</td>
                  <td className="py-2 pr-0">
                    {row.status ? (
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {row.status}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-xs text-slate-500"
                  >
                    Belum ada transaksi. Tambahkan transaksi baru dari halaman
                    Input Barang.
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
