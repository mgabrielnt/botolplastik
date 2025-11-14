import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { getCurrentStockForItemWarehouse } from "@/lib/stock";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: { item: true, warehouseFrom: true, warehouseTo: true },
    orderBy: { date: "desc" },
    take: 100
  });

  return NextResponse.json(transactions);
}

type Body = {
  type: TransactionType;
  itemId: number;
  warehouseFromId?: number | null;
  warehouseToId?: number | null;
  quantity: number;
  date: string;
  note?: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (!body.itemId || !body.quantity || body.quantity <= 0) {
    return NextResponse.json(
      { error: "Barang dan jumlah wajib diisi dan jumlah harus lebih besar dari 0." },
      { status: 400 }
    );
  }

  let type: TransactionType;
  try {
    type = body.type;
  } catch {
    return NextResponse.json(
      { error: "Jenis transaksi tidak valid." },
      { status: 400 }
    );
  }

  if (
    (type === "OUT" || type === "TRANSFER" || type === "LOST" || type === "DAMAGED") &&
    !body.warehouseFromId
  ) {
    return NextResponse.json(
      { error: "Gudang asal wajib diisi untuk transaksi keluar, pindah, hilang, atau rusak." },
      { status: 400 }
    );
  }

  if (type === "TRANSFER" && !body.warehouseToId) {
    return NextResponse.json(
      { error: "Gudang tujuan wajib diisi untuk transaksi pindah gudang." },
      { status: 400 }
    );
  }

  // Validasi stok untuk transaksi yang mengurangi stok
  if (type === "OUT" || type === "TRANSFER" || type === "LOST" || type === "DAMAGED") {
    const sourceWarehouseId = body.warehouseFromId!;
    const currentStock = await getCurrentStockForItemWarehouse(
      body.itemId,
      sourceWarehouseId
    );
    if (currentStock < body.quantity) {
      return NextResponse.json(
        {
          error: `Stok tidak mencukupi di gudang asal. Stok saat ini: ${currentStock.toLocaleString(
            "id-ID"
          )}`
        },
        { status: 400 }
      );
    }
  }

  const date = new Date(body.date || new Date().toISOString());
  const created = await prisma.transaction.create({
    data: {
      itemId: body.itemId,
      type,
      date: isNaN(date.getTime()) ? new Date() : date,
      quantity: body.quantity,
      warehouseFromId: body.warehouseFromId ?? null,
      warehouseToId: body.warehouseToId ?? null,
      note: body.note ?? null
    }
  });

  return NextResponse.json(created, { status: 201 });
}
