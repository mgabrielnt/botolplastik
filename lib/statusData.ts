import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export type StatusRow = {
  itemId: number;
  itemCode: string;
  itemName: string;
  warehouseId: number;
  warehouseName: string;
  currentStock: number;
  totalIn: number;
  totalOut: number;
  totalLost: number;
  totalDamaged: number;
  totalFound: number;
  status: "NORMAL" | "HILANG" | "RUSAK" | "KETEMU";
};

const LOW_STOCK_THRESHOLD = 20;

export async function getStatusRows(): Promise<StatusRow[]> {
  const transactions = await prisma.transaction.findMany({
    include: {
      item: true,
      warehouseFrom: true,
      warehouseTo: true
    },
    orderBy: { date: "asc" }
  });

  const map = new Map<string, StatusRow>();

  function ensureRow(itemId: number, itemCode: string, itemName: string, warehouseId: number, warehouseName: string): StatusRow {
    const key = `${itemId}-${warehouseId}`;
    if (!map.has(key)) {
      map.set(key, {
        itemId,
        itemCode,
        itemName,
        warehouseId,
        warehouseName,
        currentStock: 0,
        totalIn: 0,
        totalOut: 0,
        totalLost: 0,
        totalDamaged: 0,
        totalFound: 0,
        status: "NORMAL"
      });
    }
    return map.get(key)!;
  }

  for (const t of transactions) {
    const item = t.item;
    const qty = t.quantity;

    if (t.type === TransactionType.RESTOCK || t.type === TransactionType.FOUND) {
      const w = t.warehouseTo ?? t.warehouseFrom;
      if (!w) continue;
      const row = ensureRow(item.id, item.code, item.name, w.id, w.name);
      row.currentStock += qty;
      row.totalIn += qty;
      if (t.type === TransactionType.FOUND) {
        row.totalFound += qty;
      }
    }

    if (t.type === TransactionType.OUT) {
      const w = t.warehouseFrom ?? t.warehouseTo;
      if (!w) continue;
      const row = ensureRow(item.id, item.code, item.name, w.id, w.name);
      row.currentStock -= qty;
      row.totalOut += qty;
    }

    if (t.type === TransactionType.TRANSFER) {
      const from = t.warehouseFrom;
      const to = t.warehouseTo;
      if (from) {
        const rowFrom = ensureRow(item.id, item.code, item.name, from.id, from.name);
        rowFrom.currentStock -= qty;
        rowFrom.totalOut += qty;
      }
      if (to) {
        const rowTo = ensureRow(item.id, item.code, item.name, to.id, to.name);
        rowTo.currentStock += qty;
        rowTo.totalIn += qty;
      }
    }

    if (t.type === TransactionType.LOST) {
      const w = t.warehouseFrom ?? t.warehouseTo;
      if (!w) continue;
      const row = ensureRow(item.id, item.code, item.name, w.id, w.name);
      row.currentStock -= qty;
      row.totalLost += qty;
    }

    if (t.type === TransactionType.DAMAGED) {
      const w = t.warehouseFrom ?? t.warehouseTo;
      if (!w) continue;
      const row = ensureRow(item.id, item.code, item.name, w.id, w.name);
      row.currentStock -= qty;
      row.totalDamaged += qty;
    }
  }

  const rows: StatusRow[] = [];
  for (const row of map.values()) {
    if (row.totalLost > row.totalFound) {
      row.status = "HILANG";
    } else if (row.totalDamaged > 0) {
      row.status = "RUSAK";
    } else if (row.totalFound > 0) {
      row.status = "KETEMU";
    } else {
      row.status = "NORMAL";
    }
    rows.push(row);
  }

  rows.sort((a, b) => {
    if (a.warehouseName === b.warehouseName) {
      return a.itemCode.localeCompare(b.itemCode);
    }
    return a.warehouseName.localeCompare(b.warehouseName);
  });

  return rows;
}
