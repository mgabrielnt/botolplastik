#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { PrismaClient, TransactionType, ItemStatus } = require("@prisma/client");

const prisma = new PrismaClient();

function mapTransactionType(raw) {
  const v = (raw || "").toString().toLowerCase();
  if (v.includes("masuk") || v.includes("restock")) return TransactionType.RESTOCK;
  if (v.includes("keluar") || v.includes("jual")) return TransactionType.OUT;
  if (v.includes("pindah")) return TransactionType.TRANSFER;
  if (v.includes("hilang")) return TransactionType.LOST;
  if (v.includes("rusak")) return TransactionType.DAMAGED;
  if (v.includes("ketemu") || v.includes("temu") || v.includes("found")) return TransactionType.FOUND;
  return TransactionType.RESTOCK;
}

function mapStatus(raw) {
  const v = (raw || "").toString().toLowerCase();
  if (!v || v === "normal") return ItemStatus.NORMAL;
  if (v.includes("hilang")) return ItemStatus.LOST;
  if (v.includes("rusak")) return ItemStatus.DAMAGED;
  if (v.includes("ketemu") || v.includes("temu") || v.includes("found")) return ItemStatus.FOUND;
  return ItemStatus.NORMAL;
}

async function upsertWarehouse(name) {
  if (!name) return null;
  const code = name.toLowerCase().replace(/\s+/g, "-");
  const existing = await prisma.warehouse.findFirst({ where: { code } });
  if (existing) return existing;
  return prisma.warehouse.create({
    data: {
      code,
      name
    }
  });
}

async function upsertItem(code, name) {
  const existing = await prisma.item.findFirst({ where: { code } });
  if (existing) return existing;
  return prisma.item.create({
    data: {
      code,
      name
    }
  });
}

async function main() {
  const filePath = path.join(__dirname, "..", "data", "gudang_botol.csv");
  if (!fs.existsSync(filePath)) {
    console.error("File gudang_botol.csv tidak ditemukan di folder data/");
    process.exit(1);
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isHeader = true;
  let count = 0;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cols = trimmed.split(",");
    if (cols.length < 8) {
      console.warn("Baris di-skip (kolom kurang dari 8):", trimmed);
      continue;
    }

    const [
      kode,
      nama,
      jenisTransaksi,
      tanggalStr,
      qtyStr,
      gudangAsalName,
      gudangTujuanName,
      statusStr
    ] = cols;

    const quantity = parseInt(qtyStr, 10);
    if (!quantity || quantity <= 0) continue;

    const date = new Date(tanggalStr);
    const safeDate = isNaN(date.getTime()) ? new Date() : date;

    const item = await upsertItem(kode, nama);
    const fromWarehouse = await upsertWarehouse(gudangAsalName);
    const toWarehouse = await upsertWarehouse(gudangTujuanName);
    const type = mapTransactionType(jenisTransaksi);
    const status = mapStatus(statusStr);

    await prisma.transaction.create({
      data: {
        itemId: item.id,
        type,
        status,
        date: safeDate,
        quantity,
        warehouseFromId: fromWarehouse ? fromWarehouse.id : null,
        warehouseToId: toWarehouse ? toWarehouse.id : null
      }
    });

    count += 1;
  }

  console.log(`Seed selesai. ${count} baris transaksi diimport dari CSV.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
