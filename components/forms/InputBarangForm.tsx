"use client";

import { useState } from "react";
import type { Item, Warehouse, TransactionType } from "@prisma/client";

type Props = {
  items: Item[];
  warehouses: Warehouse[];
};

type ToastState = { type: "success" | "error"; message: string } | null;

const TRANSACTION_LABELS: { value: TransactionType; label: string }[] = [
  { value: "RESTOCK", label: "Restock (Barang Masuk)" },
  { value: "OUT", label: "Keluar / Terjual" },
  { value: "TRANSFER", label: "Pindah Gudang" },
  { value: "LOST", label: "Hilang" },
  { value: "DAMAGED", label: "Rusak" },
  { value: "FOUND", label: "Ketemu (Recovered)" }
];

export default function InputBarangForm({ items, warehouses }: Props) {
  const [type, setType] = useState<TransactionType>("RESTOCK");
  const [itemId, setItemId] = useState<number | "">("");
  const [warehouseFromId, setWarehouseFromId] = useState<number | "">("");
  const [warehouseToId, setWarehouseToId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const resetForm = () => {
    setType("RESTOCK");
    setItemId("");
    setWarehouseFromId("");
    setWarehouseToId("");
    setQuantity("");
    setDate(new Date().toISOString().slice(0, 10));
    setNote("");
  };

  const showToast = (t: ToastState) => {
    setToast(t);
    if (t) {
      setTimeout(() => setToast(null), 4000);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    if (!itemId || !quantity || quantity <= 0) {
      showToast({ type: "error", message: "Barang dan jumlah harus diisi dengan benar." });
      setLoading(false);
      return;
    }

    if (
      (type === "OUT" || type === "TRANSFER" || type === "LOST" || type === "DAMAGED") &&
      !warehouseFromId
    ) {
      showToast({
        type: "error",
        message: "Gudang asal wajib diisi untuk transaksi keluar, pindah, hilang, atau rusak."
      });
      setLoading(false);
      return;
    }

    if (type === "TRANSFER" && !warehouseToId) {
      showToast({
        type: "error",
        message: "Gudang tujuan wajib diisi untuk transaksi pindah gudang."
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type,
          itemId,
          warehouseFromId: warehouseFromId || null,
          warehouseToId: warehouseToId || null,
          quantity,
          date,
          note
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan transaksi.");
      }

      showToast({ type: "success", message: "Transaksi berhasil disimpan." });
      resetForm();
    } catch (err: any) {
      showToast({
        type: "error",
        message: err.message || "Terjadi kesalahan saat menyimpan transaksi."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card"
      >
        <div className="card-inner space-y-4">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Input transaksi barang
            </h1>
            <p className="text-xs text-slate-500">
              Catat restock, penjualan, perpindahan gudang, barang hilang, rusak, atau ketemu.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Jenis transaksi
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
              >
                {TRANSACTION_LABELS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Tanggal transaksi</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Barang</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={itemId}
                onChange={(e) => setItemId(Number(e.target.value) || "")}
              >
                <option value="">Pilih barang...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Jumlah (qty)
              </label>
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Gudang asal{" "}
                {(type === "OUT" ||
                  type === "TRANSFER" ||
                  type === "LOST" ||
                  type === "DAMAGED") && <span className="text-red-500">*</span>}
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={warehouseFromId}
                onChange={(e) =>
                  setWarehouseFromId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">Pilih gudang asal...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Gudang tujuan{" "}
                {type === "TRANSFER" && <span className="text-red-500">*</span>}
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={warehouseToId}
                onChange={(e) =>
                  setWarehouseToId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">Pilih gudang tujuan...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Catatan (opsional)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: barang rusak karena pecah di perjalanan..."
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-2 text-[11px] text-slate-500">
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
                Validasi stok otomatis
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
                Error tampil sebagai toast elegan
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan transaksi"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
              Setelah simpan, cek ringkasannya di Dashboard
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
              Status stok real-time terlihat di Status Barang
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
