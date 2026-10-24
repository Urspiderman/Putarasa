"use client";

import PutarasaLogo from "@/components/landing/PutarasaLogo";
import { useEffect, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  History,
  UserRound,
  Truck,
  Menu,
  X,
  Leaf,
  LogOut,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ArrowLeftRight,
  ChevronDown,
  ShieldCheck,
  Store,
  Recycle,
  Check,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

// ======================================================
// TYPES
// ======================================================

type NavItem = {
  label: string;
  href: string;
  icon: ElementType;
};

type MenuGroup = {
  title: string;
  items: NavItem[];
};

type UserRole = "admin" | "supplier" | "courier" | "buyer";

type RoleOption = {
  role: UserRole;
  label: string;
  href: string;
  icon: ElementType;
};

// ======================================================
// NAVIGATION
// ======================================================

const menuGroups: MenuGroup[] = [
  {
    title: "MENU UTAMA",
    items: [
      {
        label: "Dashboard",
        href: "/courier/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Tugas Saya",
        href: "/courier/tugas",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "OPERASIONAL",
    items: [
      {
        label: "Peta Operasional",
        href: "/courier/operasional",
        icon: MapPinned,
      },
      {
        label: "Pesanan",
        href: "/courier/pesan",
        icon: ShoppingBag,
      },
      {
        label: "Riwayat",
        href: "/courier/riwayat",
        icon: History,
      },
    ],
  },
  {
    title: "AKUN",
    items: [
      {
        label: "Profil",
        href: "/courier/profil",
        icon: UserRound,
      },
    ],
  },
];

const roleOptions: RoleOption[] = [
  {
    role: "admin",
    label: "Admin",
    href: "/admin/dashboard",
    icon: ShieldCheck,
  },
  {
    role: "supplier",
    label: "Supplier",
    href: "/supplier/dashboard",
    icon: Recycle,
  },
  {
    role: "courier",
    label: "Kurir",
    href: "/courier/dashboard",
    icon: Truck,
  },
  {
    role: "buyer",
    label: "Buyer",
    href: "/buyer/dashboard",
    icon: Store,
  },
];

function isUserRole(value: unknown): value is UserRole {
  return (
    value === "admin" ||
    value === "supplier" ||
    value === "courier" ||
    value === "buyer"
  );
}

// ======================================================
// ROLE SWITCHER
// ======================================================

function CourierRoleSwitcher({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRoles() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(authError.message);
        }

        if (!user) {
          throw new Error("Sesi pengguna tidak ditemukan.");
        }

        const { data, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (rolesError) {
          throw new Error(rolesError.message);
        }

        const availableRoles = Array.from(
          new Set(
            (data ?? [])
              .map((item) => item.role)
              .filter(isUserRole)
          )
        );

        if (!mounted) return;

        setRoles(availableRoles);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat daftar role."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadRoles();

    return () => {
      mounted = false;
    };
  }, []);

  function switchRole(option: RoleOption) {
    if (switching || !roles.includes(option.role)) return;

    setSwitching(true);
    setOpen(false);
    onNavigate();

    // Navigasi ke workspace yang dipilih.
    // Otorisasi tetap diperiksa oleh requireRole()
    // pada layout tujuan.
    router.push(option.href);
    router.refresh();
  }

  return (
    <div className="px-4 pb-4">
      <div className="rounded-2xl border border-[#DDB63D]/60 bg-white/35 p-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="courier-role-options"
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#47763A]">
            <ArrowLeftRight size={19} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-black text-[#332417]">
              Ganti Role
            </span>

            <span className="block text-[11px] text-[#765C27]">
              Pindah workspace
            </span>
          </span>

          {loading || switching ? (
            <Loader2
              size={17}
              className="animate-spin text-[#765C27]"
            />
          ) : (
            <ChevronDown
              size={17}
              className={`text-[#765C27] transition ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {open && (
          <div
            id="courier-role-options"
            className="mt-3 space-y-1 border-t border-[#DDB63D]/50 pt-3"
          >
            {loading ? (
              <p className="px-2 py-2 text-xs text-[#765C27]">
                Memuat role...
              </p>
            ) : error ? (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {error}
              </p>
            ) : (
              roleOptions
                .filter((option) =>
                  roles.includes(option.role)
                )
                .map((option) => {
                  const Icon = option.icon;
                  const current = option.role === "courier";

                  return (
                    <button
                      key={option.role}
                      type="button"
                      disabled={current || switching}
                      onClick={() => switchRole(option)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        current
                          ? "bg-[#E8F2DE] text-[#47763A]"
                          : "text-[#5F4C25] hover:bg-white/60"
                      } disabled:cursor-default`}
                    >
                      <Icon size={18} />

                      <span className="flex-1 text-xs font-bold">
                        {option.label}
                      </span>

                      {current && <Check size={16} />}
                    </button>
                  );
                })
            )}

            {!loading && !error && roles.length <= 1 && (
              <p className="px-2 pt-2 text-[11px] leading-5 text-[#765C27]">
                Tidak ada role lain yang tersedia
                untuk akun ini.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// SIDEBAR
// ======================================================

export default function CourierSidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function renderSidebarContent() {
    return (
      <div className="flex h-full flex-col bg-[#FFDA57] text-[#332417]">
        {/* BRAND */}
        <div className="border-b border-[#DDB63D]/50 px-5 pb-5 pt-6">
          <Link
            href="/courier/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFDF5] shadow-sm">
              <PutarasaLogo size={42} showText={false} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#FFDA57] bg-[#47763A]" />
            </div>

            <div>
              <h1 className="text-[21px] font-black tracking-tight">
                PUTARASA
              </h1>

              <p className="text-[10px] font-extrabold tracking-[0.18em] text-[#80621C]">
                COURIER WORKSPACE
              </p>
            </div>
          </Link>
        </div>

        {/* GREETING */}
        <div className="px-4 pt-5">
          <div className="relative overflow-hidden rounded-[20px] border border-white/50 bg-[#FFF0B0] p-4 shadow-sm">
            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20" />

            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5">
                <Truck
                  size={13}
                  className="text-[#8A681A]"
                />

                <span className="text-[10px] font-extrabold tracking-wide text-[#8A681A]">
                  PANEL KURIR
                </span>
              </div>

              <h2 className="flex items-center gap-2 text-[18px] font-black text-[#49361C]">
                Halo, Kurir!

                <Sparkles
                  size={18}
                  className="text-[#B8860B]"
                />
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#806637]">
                Siap menjalankan pengantaran dan
                penjemputan hari ini?
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav
          aria-label="Navigasi Kurir"
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
                          : "text-[#5F4C25] hover:bg-white/35 hover:text-[#332417]"
                      }`}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#47763A]" />
                      )}

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${
                          active
                            ? "bg-[#E8F2DE] text-[#426D32]"
                            : "bg-[#F7C947] text-[#5F4C25] group-hover:bg-white/40"
                        }`}
                      >
                        <Icon size={18} />
                      </span>

                      <span
                        className={`flex-1 text-[13px] ${
                          active
                            ? "font-extrabold"
                            : "font-semibold"
                        }`}
                      >
                        {item.label}
                      </span>

                      <ChevronRight
                        size={15}
                        className={`transition-all ${
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
        <CourierRoleSwitcher onNavigate={closeMenu} />

        {/* PROFILE & LOGOUT */}
        <div className="border-t border-[#DDB63D]/50 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/35 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF5] text-[#426D32]">
              <Truck size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold">
                Kurir PUTARASA
              </p>

              <p className="text-[11px] text-[#765C27]">
                Delivery & Pickup
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
  }

  return (
    <>
      {/* MOBILE TOPBAR */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#DDB63D]/50 bg-[#FFDA57] px-5 lg:hidden">
        <Link
          href="/courier/dashboard"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
            <PutarasaLogo size={32} showText={false} />
          </div>

          <span className="text-lg font-black tracking-tight">
            PUTARASA
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka navigasi Kurir"
          aria-expanded={mobileOpen}
          className="rounded-xl bg-white/70 p-2.5 text-[#49361C]"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[270px] border-r border-[#DDB63D]/50 shadow-[4px_0_20px_rgba(71,52,20,0.04)] lg:block">
        {renderSidebarContent()}
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup navigasi Kurir"
            onClick={closeMenu}
            className="absolute inset-0 bg-[#251A0F]/50"
          />

          <aside className="relative h-full w-[290px] max-w-[85vw] shadow-2xl">
            {renderSidebarContent()}

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

