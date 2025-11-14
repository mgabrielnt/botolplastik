import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.item.findMany({
    orderBy: { name: "asc" }
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { code, name, category } = body as {
    code?: string;
    name?: string;
    category?: string | null;
  };

  if (!code || !name) {
    return NextResponse.json(
      { error: "Kode dan nama barang wajib diisi." },
      { status: 400 }
    );
  }

  const item = await prisma.item.create({
    data: {
      code,
      name,
      category: category ?? null
    }
  });

  return NextResponse.json(item, { status: 201 });
}
