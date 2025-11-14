import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

/**
 * Hitung stok terkini untuk kombinasi item + gudang tertentu
 * berdasarkan seluruh riwayat transaksi.
 */
export async function getCurrentStockForItemWarehouse(itemId: number, warehouseId: number): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    where: {
      itemId,
      OR: [{ warehouseFromId: warehouseId }, { warehouseToId: warehouseId }]
    }
  });

  let stock = 0;

  for (const t of transactions) {
    const qty = t.quantity;
    const fromMatch = t.warehouseFromId === warehouseId;
    const toMatch = t.warehouseToId === warehouseId;

    switch (t.type) {
      case TransactionType.RESTOCK:
      case TransactionType.FOUND:
        if (toMatch || (!t.warehouseToId && fromMatch)) {
          stock += qty;
        }
        break;
      case TransactionType.OUT:
        if (fromMatch) {
          stock -= qty;
        }
        break;
      case TransactionType.TRANSFER:
        if (fromMatch) {
          stock -= qty;
        }
        if (toMatch) {
          stock += qty;
        }
        break;
      case TransactionType.LOST:
      case TransactionType.DAMAGED:
        if (fromMatch || (!t.warehouseFromId && toMatch)) {
          stock -= qty;
        }
        break;
      default:
        break;
    }
  }

  return stock;
}
