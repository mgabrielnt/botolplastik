"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/status-barang", label: "Status Barang" },
  { href: "/input-barang", label: "Input Barang" }
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-slate-900 flex items-center justify-center text-xs font-semibold text-white">
              GB
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                Gudang Botol Dashboard
              </span>
              <span className="text-xs text-slate-500">
                Monitoring stok & pergerakan barang
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "nav-link",
                    active ? "nav-link-active" : "nav-link-inactive"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="md:hidden">
            {/* Simple mobile menu placeholder */}
            <select
              className="border border-slate-200 rounded-full px-3 py-1 text-sm bg-white"
              value={navItems.find((i) => pathname?.startsWith(i.href))?.href ?? "/dashboard"}
              onChange={(e) => (window.location.href = e.target.value)}
            >
              {navItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
