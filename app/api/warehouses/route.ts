import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: "asc" }
  });
  return NextResponse.json(warehouses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { code, name } = body as { code?: string; name?: string };

  if (!code || !name) {
    return NextResponse.json(
      { error: "Kode dan nama gudang wajib diisi." },
      { status: 400 }
    );
  }

  const warehouse = await prisma.warehouse.create({
    data: { code, name }
  });

  return NextResponse.json(warehouse, { status: 201 });
}
