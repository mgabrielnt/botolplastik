import { prisma } from "@/lib/prisma";
import InputBarangForm from "@/components/forms/InputBarangForm";

export const dynamic = "force-dynamic";

export default async function InputBarangPage() {
  const [items, warehouses] = await Promise.all([
    prisma.item.findMany({ orderBy: { code: "asc" } }),
    prisma.warehouse.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-4">
      <InputBarangForm items={items} warehouses={warehouses} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="card-inner space-y-2 text-xs text-slate-600">
            <h2 className="text-sm font-semibold text-slate-900">
              Tips penggunaan halaman Input Barang
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Gunakan <span className="font-semibold">Restock</span> untuk
                barang masuk pertama kali atau penambahan stok.
              </li>
              <li>
                Pilih <span className="font-semibold">Keluar</span> untuk
                penjualan atau barang keluar dari gudang.
              </li>
              <li>
                Gunakan <span className="font-semibold">Pindah Gudang</span>{" "}
                untuk memindahkan stok antar gudang.
              </li>
              <li>
                Catat <span className="font-semibold">Hilang</span> dan{" "}
                <span className="font-semibold">Rusak</span> untuk menjaga
                akuntabilitas stok.
              </li>
              <li>
                Jika barang yang hilang ditemukan, gunakan{" "}
                <span className="font-semibold">Ketemu</span> untuk mengembalikan
                stok.
              </li>
            </ul>
          </div>
        </div>
        <div className="card">
          <div className="card-inner space-y-2 text-xs text-slate-600">
            <h2 className="text-sm font-semibold text-slate-900">
              Terkait integrasi dengan Dashboard
            </h2>
            <p>
              Setiap transaksi yang Anda simpan di sini akan langsung
              mempengaruhi:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Kartu KPI di Dashboard (stok, hilang, rusak, dll).</li>
              <li>Grafik pergerakan barang harian dan per gudang.</li>
              <li>Status stok per barang di halaman Status Barang.</li>
              <li>Daftar 10 transaksi terbaru di Dashboard.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
