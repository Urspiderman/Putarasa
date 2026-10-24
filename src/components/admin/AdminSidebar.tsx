
"use client";

import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Role } from "@/lib/roles";
import AdminRoleSwitcher from "@/components/admin/AdminRoleSwitcher";

import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Truck,
  Recycle,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  ChartNoAxesCombined,
  Settings,
  Menu,
  X,
  Leaf,
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Gift,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ElementType;
};

type MenuGroup = {
  title: string;
  items: NavItem[];
};

const menuGroups: MenuGroup[] = [
  {
    title: "MENU UTAMA",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Pengguna",
        href: "/admin/pengguna",
        icon: Users,
      },
      {
        label: "Verifikasi Akun",
        href: "/admin/verifikasi",
        icon: BadgeCheck,
      },
    ],
  },
  {
    title: "OPERASIONAL",
    items: [
      {
        label: "Penjemputan",
        href: "/admin/penjemputan",
        icon: Truck,
      },
      {
        label: "Pengolahan",
        href: "/admin/pengolahan",
        icon: Recycle,
      },
      {
        label: "Dampak Lingkungan",
        href: "/admin/dampak-lingkungan",
        icon: Leaf,
      },
      {
        label: "Produk",
        href: "/admin/produk",
        icon: Package,
      },
      {
        label: "Inventori",
        href: "/admin/inventori",
        icon: Boxes,
      },
    ],
  },
  {
    title: "BISNIS & SISTEM",
    items: [
      {
        label: "Pesanan",
        href: "/admin/pesanan",
        icon: ShoppingCart,
      },
      {
        label: "Pembayaran",
        href: "/admin/pembayaran",
        icon: CreditCard,
      },
      {
        label: "Laporan",
        href: "/admin/laporan",
        icon: ChartNoAxesCombined,
      },
      {
        label: "Pengaturan",
        href: "/admin/pengaturan",
        icon: Settings,
      },
    ],
  },
  {
    title: "PROGRAM PUTARASA",
    items: [
      {
        label: "PUTARASA Poin",
        href: "/admin/points",
        icon: Gift,
      },
    ],
  },
];

export default function AdminSidebar({
  roles,
}: {
  roles: Role[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  function isActive(href: string) {
    if (href === "/admin/points") {
      return (
        pathname === "/admin/points" ||
        pathname.startsWith("/admin/points/") ||
        pathname.startsWith("/admin/outlets") ||
        pathname.startsWith("/admin/deposits") ||
        pathname.startsWith("/admin/partners") ||
        pathname.startsWith("/admin/rewards") ||
        pathname.startsWith("/admin/points-budget") ||
        pathname.startsWith("/admin/points-redemptions")
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#FFDA57] text-[#332417]">
      {/* BRAND */}
      <div className="border-b border-[#DDB63D]/50 px-5 pb-5 pt-6">
        <Link
          href="/admin/dashboard"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFDF5] shadow-sm">
            <Leaf
              size={26}
              strokeWidth={2.6}
              className="text-[#426D32]"
            />

            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#FFDA57] bg-[#47763A]" />
          </div>

          <div>
            <h1 className="text-[21px] font-black tracking-tight text-[#332417]">
              PUTARASA
            </h1>

            <p className="text-[10px] font-extrabold tracking-[0.18em] text-[#80621C]">
              ADMIN WORKSPACE
            </p>
          </div>
        </Link>
      </div>

      {/* GREETING CARD */}
      <div className="px-4 pt-5">
        <div className="relative overflow-hidden rounded-[20px] border border-white/50 bg-[#FFF0B0] p-4 shadow-sm">
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 right-7 h-20 w-20 rounded-full bg-white/20" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5">
              <ShieldCheck
                size={13}
                className="text-[#8A681A]"
              />

              <span className="text-[10px] font-extrabold tracking-wide text-[#8A681A]">
                PANEL PENGELOLA
              </span>
            </div>

            <h2 className="flex items-center gap-2 text-[18px] font-black text-[#49361C]">
              Halo, Admin!

              <Sparkles
                size={18}
                className="text-[#B8860B]"
              />
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#806637]">
              Siap kelola dampak baik hari ini?
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav
        aria-label="Navigasi Admin"
        className="mt-5 flex-1 space-y-5 overflow-y-auto px-3 pb-5"
      >
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-extrabold tracking-[0.17em] text-[#86651B]">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const isPoints =
                  item.href === "/admin/points";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={`group relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition-all duration-200 ${
                      active
                        ? "bg-[#FFFDF5] text-[#365B2D] shadow-[0_4px_12px_rgba(101,76,14,0.10)]"
                        : isPoints
                          ? "bg-[#F7C947]/70 text-[#49361C] hover:bg-white/50"
                          : "text-[#5F4C25] hover:bg-white/35 hover:text-[#332417]"
                    }`}
                  >
                    {active && (
                      <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#47763A]" />
                    )}

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] transition ${
                        active
                          ? "bg-[#E8F2DE] text-[#426D32]"
                          : isPoints
                            ? "bg-[#47763A] text-white"
                            : "bg-[#F7C947] text-[#5F4C25] group-hover:bg-white/40"
                      }`}
                    >
                      <Icon size={18} />
                    </span>

                    <span
                      className={`flex-1 text-[13px] ${
                        active || isPoints
                          ? "font-extrabold"
                          : "font-semibold"
                      }`}
                    >
                      {item.label}
                    </span>

                    {isPoints && !active ? (
                      <span className="rounded-full bg-[#EAF3DF] px-2 py-1 text-[9px] font-black text-[#47763A]">
                        BARU
                      </span>
                    ) : null}

                    <ChevronRight
                      size={15}
                      className={`transition-all duration-200 ${
                        active
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ROLE SWITCHER */}
      <AdminRoleSwitcher
        roles={roles}
        onNavigate={closeMenu}
      />

      {/* ADMIN PROFILE */}
      <div className="border-t border-[#DDB63D]/50 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/35 px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF5] text-[#426D32]">
            <ShieldCheck size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-extrabold text-[#332417]">
              Administrator
            </p>

            <p className="text-[11px] text-[#765C27]">
              PUTARASA Management
            </p>
          </div>

          <Link
            href="/auth/logout"
            onClick={closeMenu}
            aria-label="Keluar akun"
            title="Keluar akun"
            className="rounded-lg bg-white/60 p-2 text-[#9C4C3C] transition hover:bg-white hover:text-red-600"
          >
            <LogOut size={18} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOPBAR */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#DDB63D]/50 bg-[#FFDA57] px-5 lg:hidden">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
            <Leaf
              size={20}
              className="text-[#426D32]"
            />
          </div>

          <span className="text-lg font-black tracking-tight text-[#332417]">
            PUTARASA
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka navigasi Admin"
          aria-expanded={mobileOpen}
          className="rounded-xl bg-white/70 p-2.5 text-[#49361C]"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[270px] border-r border-[#DDB63D]/50 shadow-[4px_0_20px_rgba(71,52,20,0.04)] lg:block">
        {sidebarContent}
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup navigasi Admin"
            onClick={closeMenu}
            className="absolute inset-0 bg-[#251A0F]/50"
          />

          <aside className="relative h-full w-[290px] max-w-[85vw] shadow-2xl">
            {sidebarContent}

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Tutup menu"
              className="absolute right-3 top-3 rounded-lg bg-white p-2 text-[#49361C] shadow-sm"
            >
              <X size={18} />
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
