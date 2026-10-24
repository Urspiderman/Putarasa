
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  House,
  Store,
  ShoppingCart,
  Package,
  UserRound,
  Leaf,
  ChevronDown,
  Check,
  ArrowLeftRight,
  ShieldCheck,
  Recycle,
  Truck,
  LogOut,
  CalendarDays,
  History,
  Sprout,
  Coins,
} from "lucide-react";

import {
  type Role,
  getRoleDashboard,
} from "@/lib/roles";

import { createClient } from "@/lib/supabase/client";

type Props = {
  name?: string;
  roles: Role[];
};

const menus = [
  {
    href: "/supplier/dashboard",
    label: "Beranda",
    icon: House,
  },
  {
    href: "/supplier/marketplace",
    label: "Marketplace",
    icon: Store,
  },
  {
    href: "/supplier/keranjang",
    label: "Keranjang",
    icon: ShoppingCart,
  },
  {
    href: "/supplier/pesanan",
    label: "Pesanan",
    icon: Package,
  },
  {
    href: "/supplier/penjemputan",
    label: "Penjemputan",
    icon: Truck,
  },
  {
    href: "/supplier/jadwal",
    label: "Jadwal",
    icon: CalendarDays,
  },
  {
    href: "/supplier/riwayat",
    label: "Riwayat",
    icon: History,
  },
  {
    href: "/supplier/dampak",
    label: "Dampak",
    icon: Sprout,
  },
  {
    href: "/supplier/points",
    label: "PUTARASA Poin",
    icon: Coins,
  },
  {
    href: "/supplier/profil",
    label: "Profil",
    icon: UserRound,
  },
];

function getRoleInfo(role: Role) {
  switch (role) {
    case "supplier":
      return {
        label: "Supplier",
        description: "Kelola penyetoran sampah organik",
        icon: Recycle,
      };

    case "buyer":
      return {
        label: "Buyer",
        description: "Belanja produk PUTARASA",
        icon: ShoppingCart,
      };

    case "courier":
      return {
        label: "Courier",
        description: "Kelola penjemputan",
        icon: Truck,
      };

    case "admin":
      return {
        label: "Admin",
        description: "Kelola sistem PUTARASA",
        icon: ShieldCheck,
      };

    default:
      return {
        label: String(role),
        description: "Buka ruang kerja",
        icon: UserRound,
      };
  }
}

export default function SupplierNavigation({
  name = "Supplier",
  roles,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const profileRef = useRef<HTMLDivElement>(null);

  const firstName =
    name.trim().split(/\s+/)[0] || "Supplier";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  function switchRole(role: Role) {
    if (!roles.includes(role)) return;

    setProfileOpen(false);

    if (role !== "supplier") {
      router.push(getRoleDashboard(role));
    }
  }

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        window.alert(
          "Gagal keluar dari akun. Silakan coba lagi."
        );
        return;
      }

      router.replace("/auth/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 lg:px-8">
      <div className="relative mx-auto flex min-h-[76px] w-full max-w-[1500px] items-center justify-between gap-3 rounded-[24px] border border-[#F3CB48] bg-[#FFDA57] px-3 py-2.5 shadow-[0_8px_28px_rgba(109,79,20,0.13)] sm:px-5 lg:px-8">

        {/* BRAND */}
        <Link
          href="/supplier/dashboard"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="PUTARASA Supplier Beranda"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/50">
            <Leaf
              size={27}
              fill="#47763A"
              className="text-[#47763A]"
            />
          </div>

          <div className="hidden xl:block">
            <p className="text-lg font-black leading-tight text-[#332417]">
              PUTARASA
            </p>

            <p className="text-[10px] font-semibold text-[#5B481D]">
              Dari Dapur, Untuk Bumi
            </p>
          </div>
        </Link>

        {/* NAVIGASI SUPPLIER */}
        <nav
          aria-label="Navigasi Supplier"
          className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1.5"
        >
          {menus.map((menu) => {
            const Icon = menu.icon;

            const active =
              pathname === menu.href ||
              pathname.startsWith(`${menu.href}/`);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                title={menu.label}
                aria-label={menu.label}
                aria-current={active ? "page" : undefined}
                className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all sm:h-11 sm:w-11 xl:h-12 xl:w-12 ${
                  active
                    ? "bg-[#315F2E] text-white shadow-md"
                    : "bg-white/35 text-[#332417] hover:bg-white/70"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.7 : 2.3}
                />

                <span className="sr-only">
                  {menu.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* PROFIL DAN GANTI ROLE */}
        <div
          ref={profileRef}
          className="relative shrink-0"
        >
          <button
            type="button"
            onClick={() =>
              setProfileOpen((value) => !value)
            }
            aria-label="Buka menu akun dan ganti role"
            aria-expanded={profileOpen}
            className={`flex items-center gap-2 rounded-2xl px-1.5 py-2 transition sm:gap-3 sm:px-3 ${
              profileOpen
                ? "bg-white/50"
                : "hover:bg-white/25"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#47763A] text-sm font-black text-white ring-2 ring-white/70">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="hidden text-left lg:block">
              <p className="text-xs text-[#655221]">
                Halo,
              </p>

              <p className="max-w-[110px] truncate text-sm font-black text-[#332417]">
                {firstName}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-[#332417] transition-transform lg:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+15px)] z-[60] w-[290px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[24px] border border-[#EDE5D6] bg-white p-3 shadow-[0_18px_55px_rgba(51,36,23,0.18)]">

              {/* INFORMASI AKUN */}
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3DF] text-lg font-black text-[#47763A]">
                  {firstName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#332417]">
                    {name}
                  </p>

                  <p className="mt-1 text-xs text-[#8C7A65]">
                    Akun PUTARASA
                  </p>
                </div>
              </div>

              <div className="my-2 h-px bg-[#EFE5D4]" />

              {/* PILIH ROLE */}
              <div className="flex items-center gap-2 px-3 py-2">
                <ArrowLeftRight
                  size={15}
                  className="text-[#47763A]"
                />

                <p className="text-[11px] font-black uppercase tracking-wider text-[#8C7A65]">
                  Ganti Role
                </p>
              </div>

              <div className="space-y-1">
                {roles.map((role) => {
                  const info = getRoleInfo(role);
                  const Icon = info.icon;
                  const active = role === "supplier";

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => switchRole(role)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                        active
                          ? "bg-[#EAF3DF]"
                          : "hover:bg-[#FFFBF1]"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-[#47763A] text-white"
                            : "bg-[#F5F1E8] text-[#47763A]"
                        }`}
                      >
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-[#332417]">
                          {info.label}
                        </p>

                        <p className="mt-1 text-[11px] leading-4 text-[#8C7A65]">
                          {info.description}
                        </p>
                      </div>

                      {active && (
                        <Check
                          size={19}
                          className="shrink-0 text-[#47763A]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="my-3 h-px bg-[#EFE5D4]" />

              {/* PROFIL */}
              <Link
                href="/supplier/profil"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#332417] hover:bg-[#FFFBF1]"
              >
                <UserRound
                  size={19}
                  className="text-[#47763A]"
                />
                Profil Saya
              </Link>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut size={19} />

                {isPending
                  ? "Sedang Keluar..."
                  : "Keluar / Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
