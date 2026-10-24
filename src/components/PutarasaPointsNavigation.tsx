
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Scale,
  Store,
  Gift,
  Wallet,
  ClipboardCheck,
  Landmark,
  ArrowUpRight,
} from "lucide-react";

type Role = "admin" | "supplier";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
  description: string;
};

const adminItems: NavigationItem[] = [
  {
    label: "Dashboard Admin",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Kembali ke halaman utama",
  },
  {
    label: "Outlet",
    href: "/admin/outlets",
    icon: MapPin,
    description: "Lokasi penerimaan sampah",
  },
  {
    label: "Setoran Sampah",
    href: "/admin/deposits",
    icon: Scale,
    description: "Pencatatan dan verifikasi",
  },
  {
    label: "Warung Mitra",
    href: "/admin/partners",
    icon: Store,
    description: "Lokasi pengambilan hadiah",
  },
  {
    label: "Katalog Hadiah",
    href: "/admin/rewards",
    icon: Gift,
    description: "Kelola hadiah sembako",
  },
  {
    label: "Anggaran Poin",
    href: "/admin/points-budget",
    icon: Landmark,
    description: "Dana sponsor dan alokasi",
  },
  {
    label: "Penukaran",
    href: "/admin/points-redemptions",
    icon: ClipboardCheck,
    description: "Proses pengambilan hadiah",
  },
];

const supplierItems: NavigationItem[] = [
  {
    label: "Dashboard Supplier",
    href: "/supplier",
    icon: LayoutDashboard,
    description: "Kembali ke halaman utama",
  },
  {
    label: "Dompet Poin",
    href: "/supplier/points",
    icon: Wallet,
    description: "Saldo dan riwayat poin",
  },
  {
    label: "Katalog Hadiah",
    href: "/supplier/points/rewards",
    icon: Gift,
    description: "Hadiah dan riwayat penukaran",
  },
];

export default function PutarasaPointsNavigation({
  role,
}: {
  role: Role;
}) {
  const pathname = usePathname();

  const items =
    role === "admin" ? adminItems : supplierItems;

  return (
    <nav
      aria-label="Navigasi PUTARASA Poin"
      className="rounded-[26px] border border-[#EAE1CF] bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-[#E7F0DC] px-3 py-1.5 text-xs font-bold text-[#47763A]">
            PROGRAM REWARD
          </span>

          <h2 className="mt-3 text-xl font-black text-[#332417]">
            PUTARASA Poin
          </h2>

          <p className="mt-1 text-sm text-[#817665]">
            {role === "admin"
              ? "Kelola operasional dan hadiah"
              : "Kelola poin hasil setoran sampah"}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFDA57] text-[#332417]">
          <Gift size={24} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/supplier" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-start gap-3 rounded-2xl border p-4 transition ${
                active
                  ? "border-[#47763A] bg-[#F0F7EA]"
                  : "border-[#EAE1CF] bg-[#FFFCF7] hover:border-[#A9C49D] hover:bg-[#F7FAF2]"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? "bg-[#47763A] text-white"
                    : "bg-[#FFF0B5] text-[#332417]"
                }`}
              >
                <Icon size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#332417]">
                  {item.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#817665]">
                  {item.description}
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-[#817665] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
