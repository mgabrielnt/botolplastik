import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gudang Botol Dashboard",
  description: "Dashboard gudang modern untuk memonitor stok dan pergerakan barang botol."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50">
        <Navbar />
        <main className="main-shell">{children}</main>
      </body>
    </html>
  );
}
