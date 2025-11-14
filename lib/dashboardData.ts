import { prisma } from "@/lib/prisma";
import { TransactionType, ItemStatus } from "@prisma/client";

export type DashboardKpi = {
  label: string;
  value: number | string;
  helper?: string;
};

export type TransactionsOverTimePoint = {
  date: string;
  restock: number;
  out: number;
  transfer: number;
};

export type PerWarehouseBar = {
  warehouse: string;
  restock: number;
  out: number;
  transferIn: number;
  transferOut: number;
};

export type StatusCompositionSlice = {
  status: string;
  count: number;
};

export type TopItemMovementBar = {
  itemCode: string;
  itemName: string;
  movement: number;
};

export type RecentTransactionRow = {
  id: number;
  date: string;
  type: string;
  item: string;
  quantity: number;
  warehouseFrom?: string | null;
  warehouseTo?: string | null;
  status?: string | null;
};

type DateRangeKey = "today" | "7d" | "30d" | "all";

export type DashboardData = {
  kpis: DashboardKpi[];
  transactionsOverTime: TransactionsOverTimePoint[];
  perWarehouse: PerWarehouseBar[];
  statusComposition: StatusCompositionSlice[];
  topMovement: TopItemMovementBar[];
  recentTransactions: RecentTransactionRow[];
  warehouses: { code: string; name: string }[];
  appliedRange: DateRangeKey;
  appliedWarehouse: string;
};

export type DashboardFiltersInput = {
  range?: string;
  warehouseCode?: string;
};

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function normalizeRange(raw?: string): DateRangeKey {
  if (raw === "today" || raw === "7d" || raw === "30d" || raw === "all") {
    return raw;
  }
  return "30d";
}

function getFromDate(range: DateRangeKey): Date | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = range === "7d" ? 7 : 30;
  const from = new Date(now);
  from.setDate(now.getDate() - days);
  return from;
}

export async function getDashboardData(
  filters: DashboardFiltersInput = {}
): Promise<DashboardData> {
  const range = normalizeRange(filters.range);
  const appliedWarehouse =
    filters.warehouseCode && filters.warehouseCode !== "all"
      ? filters.warehouseCode
      : "all";

  const [warehousesDb, transactionsDb] = await Promise.all([
    prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
    prisma.transaction.findMany({
      include: {
        item: true,
        warehouseFrom: true,
        warehouseTo: true
      },
      orderBy: { date: "asc" }
    })
  ]);

  const fromDate = getFromDate(range);

  let rangeTransactions = transactionsDb;
  if (fromDate) {
    rangeTransactions = rangeTransactions.filter((t) => t.date >= fromDate);
  }

  if (appliedWarehouse !== "all") {
    rangeTransactions = rangeTransactions.filter(
      (t) =>
        t.warehouseFrom?.code === appliedWarehouse ||
        t.warehouseTo?.code === appliedWarehouse
    );
  }

  // Hitung total stok global berdasarkan seluruh transaksi (tidak ter-filter range/gudang)
  let totalInForStock = 0;
  let totalOutForStock = 0;
  for (const t of transactionsDb) {
    const qty = t.quantity;
    switch (t.type) {
      case TransactionType.RESTOCK:
      case TransactionType.FOUND:
        totalInForStock += qty;
        break;
      case TransactionType.OUT:
      case TransactionType.LOST:
      case TransactionType.DAMAGED:
        totalOutForStock += qty;
        break;
      default:
        break;
    }
  }
  const totalStock = totalInForStock - totalOutForStock;

  // Agregasi berdasarkan transaksi yang sudah ter-filter
  let totalIn = 0;
  let totalOut = 0;
  let totalTransferUnits = 0;
  let totalLost = 0;
  let totalDamaged = 0;
  let totalFound = 0;

  const overTimeMap = new Map<string, TransactionsOverTimePoint>();
  const perWarehouseMap = new Map<string, PerWarehouseBar>();
  const statusMap = new Map<string, number>();
  const movementMap = new Map<
    number,
    { itemCode: string; itemName: string; movement: number }
  >();

  for (const t of rangeTransactions) {
    const key = dateKey(t.date);
    if (!overTimeMap.has(key)) {
      overTimeMap.set(key, {
        date: key,
        restock: 0,
        out: 0,
        transfer: 0
      });
    }
    const point = overTimeMap.get(key)!;

    const qty = t.quantity;

    // KPI & line chart
    switch (t.type) {
      case TransactionType.RESTOCK:
        totalIn += qty;
        point.restock += qty;
        break;
      case TransactionType.OUT:
        totalOut += qty;
        point.out += qty;
        break;
      case TransactionType.TRANSFER:
        totalTransferUnits += qty;
        point.transfer += qty;
        break;
      case TransactionType.LOST:
        totalLost += qty;
        totalOut += qty;
        break;
      case TransactionType.DAMAGED:
        totalDamaged += qty;
        totalOut += qty;
        break;
      case TransactionType.FOUND:
        totalFound += qty;
        totalIn += qty;
        break;
      default:
        break;
    }

    // per warehouse breakdown
    const fromName = t.warehouseFrom?.name ?? null;
    const toName = t.warehouseTo?.name ?? null;

    const getWarehouseRecord = (name: string): PerWarehouseBar => {
      if (!perWarehouseMap.has(name)) {
        perWarehouseMap.set(name, {
          warehouse: name,
          restock: 0,
          out: 0,
          transferIn: 0,
          transferOut: 0
        });
      }
      return perWarehouseMap.get(name)!;
    };

    if (t.type === TransactionType.RESTOCK || t.type === TransactionType.FOUND) {
      const targetName = toName || fromName;
      if (targetName) {
        const rec = getWarehouseRecord(targetName);
        rec.restock += qty;
      }
    }

    if (
      t.type === TransactionType.OUT ||
      t.type === TransactionType.LOST ||
      t.type === TransactionType.DAMAGED
    ) {
      const sourceName = fromName || toName;
      if (sourceName) {
        const rec = getWarehouseRecord(sourceName);
        rec.out += qty;
      }
    }

    if (t.type === TransactionType.TRANSFER) {
      if (fromName) {
        const rec = getWarehouseRecord(fromName);
        rec.transferOut += qty;
      }
      if (toName) {
        const rec = getWarehouseRecord(toName);
        rec.transferIn += qty;
      }
    }

    // status composition
    const statusKey =
      t.status === ItemStatus.LOST
        ? "Hilang"
        : t.status === ItemStatus.DAMAGED
        ? "Rusak"
        : t.status === ItemStatus.FOUND
        ? "Ketemu"
        : "Normal";
    statusMap.set(statusKey, (statusMap.get(statusKey) ?? 0) + qty);

    // top movement per item
    const itemKey = t.itemId;
    if (!movementMap.has(itemKey)) {
      movementMap.set(itemKey, {
        itemCode: t.item.code,
        itemName: t.item.name,
        movement: 0
      });
    }
    const mov = movementMap.get(itemKey)!;
    mov.movement += qty;
  }

  const recoveryRate =
    totalLost > 0
      ? ((totalFound / totalLost) * 100).toFixed(1) + "%"
      : totalFound > 0
      ? "100%"
      : "0%";

  const kpis: DashboardKpi[] = [
    { label: "Total stok saat ini", value: totalStock },
    { label: "Total barang masuk", value: totalIn },
    { label: "Total barang keluar", value: totalOut },
    { label: "Total barang pindah", value: totalTransferUnits },
    { label: "Total barang hilang", value: totalLost },
    { label: "Total barang rusak", value: totalDamaged },
    {
      label: "Recovery rate",
      value: recoveryRate,
      helper: "Barang hilang yang kemudian ketemu"
    }
  ];

  const transactionsOverTime = Array.from(overTimeMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const perWarehouse = Array.from(perWarehouseMap.values()).sort((a, b) =>
    a.warehouse.localeCompare(b.warehouse)
  );

  const statusComposition = Array.from(statusMap.entries()).map(
    ([status, count]) => ({
      status,
      count
    })
  );

  const topMovement = Array.from(movementMap.values())
    .sort((a, b) => b.movement - a.movement)
    .slice(0, 8)
    .map((m) => ({
      itemCode: m.itemCode,
      itemName: m.itemName,
      movement: m.movement
    }));

  const recentTxSorted = [...rangeTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  const recentTransactions: RecentTransactionRow[] = recentTxSorted.map((t) => ({
    id: t.id,
    date: t.date.toISOString().slice(0, 10),
    type: t.type,
    item: `${t.item.code} - ${t.item.name}`,
    quantity: t.quantity,
    warehouseFrom: t.warehouseFrom?.name ?? null,
    warehouseTo: t.warehouseTo?.name ?? null,
    status: t.status ?? null
  }));

  const warehouses = warehousesDb.map((w) => ({
    code: w.code,
    name: w.name
  }));

  return {
    kpis,
    transactionsOverTime,
    perWarehouse,
    statusComposition,
    topMovement,
    recentTransactions,
    warehouses,
    appliedRange: range,
    appliedWarehouse
  };
}
