"use client";

import PutarasaLogo from "@/components/landing/PutarasaLogo";
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
  MessageCircle,
  X,
  Leaf,
  ChevronDown,
  Sprout,
  Check,
  ArrowRightLeft,
  ShieldCheck,
  Recycle,
  LogOut,
} from "lucide-react";

import {
  type Role,
  getRoleDashboard,
} from "@/lib/roles";

import { createClient } from "@/lib/supabase/client";

const menus = [
  {
    href: "/buyer/dashboard",
    label: "Beranda",
    icon: House,
  },
  {
    href: "/buyer/marketplace",
    label: "Marketplace",
    icon: Store,
  },
  {
    href: "/buyer/keranjang",
    label: "Keranjang",
    icon: ShoppingCart,
  },
  {
    href: "/buyer/pesanan",
    label: "Pesanan",
    icon: Package,
  },
  {
    href: "/buyer/profil",
    label: "Profil",
    icon: UserRound,
  },
];

type Props = {
  name?: string;
  roles: Role[];
};


function getRoleInfo(role: Role) {
  switch (role) {
    case "buyer":
      return {
        label: "Buyer",
        description: "Belanja produk PUTARASA",
        icon: ShoppingCart,
      };

    case "supplier":
      return {
        label: "Supplier",
        description: "Kelola penyetoran sampah organik",
        icon: Recycle,
      };

    case "courier":
      return {
        label: "Courier",
        description: "Kelola penjemputan dan pengiriman",
        icon: Package,
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

export default function BuyerNavigation({
  name = "Buyer",
  roles,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const profileRef = useRef<HTMLDivElement>(null);

  const firstName =
    name.trim().split(" ")[0] || "Buyer";

  const currentRole: Role = "buyer";

  // Menutup dropdown jika klik di luar atau Escape.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setChatOpen(false);
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

  // Tutup menu setelah berpindah halaman.
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  function switchRole(role: Role) {
    if (!roles.includes(role)) return;

    setProfileOpen(false);

    if (role === currentRole) return;

    router.push(getRoleDashboard(role));
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
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 lg:px-8">
        <div className="relative mx-auto flex h-[76px] w-full max-w-[1500px] items-center justify-between rounded-[24px] border border-[#F3CB48] bg-[#FFDA57] px-4 shadow-[0_8px_28px_rgba(109,79,20,0.13)] sm:px-6 lg:px-8">
          {/* BRAND */}
          <Link
            href="/buyer/dashboard"
            className="flex min-w-0 items-center gap-2.5"
            aria-label="PUTARASA Beranda"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-transparent">
  <PutarasaLogo size={54} showText={false} />
</div>

            <div className="hidden sm:block">
              <p className="text-lg font-black leading-tight tracking-tight text-[#332417]">
                PUTARASA
              </p>

              <p className="text-[10px] font-semibold text-[#5B481D]">
                Dari Dapur, Untuk Bumi
              </p>
            </div>
          </Link>

          {/* NAVIGASI IKON - TETAP SAMA */}
          <nav
            aria-label="Navigasi Buyer"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 sm:gap-2"
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
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all sm:h-12 sm:w-12 ${
                    active
                      ? "bg-[#315F2E] text-white shadow-md"
                      : "bg-white/35 text-[#332417] hover:bg-white/70"
                  }`}
                >
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.7 : 2.3}
                  />

                  <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#332417] px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
                    {menu.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* PROFIL DAN ROLE SWITCHER */}
          <div
            ref={profileRef}
            className="relative ml-auto shrink-0"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((value) => !value)
              }
              aria-label="Buka menu akun dan ganti role"
              aria-haspopup="true"
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

            {/* DROPDOWN PROFIL */}
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+15px)] z-[60] w-[290px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[24px] border border-[#EDE5D6] bg-white p-3 shadow-[0_18px_55px_rgba(51,36,23,0.18)]">
                {/* HEADER AKUN */}
                <div className="flex items-center gap-3 px-2 py-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3DF] text-lg font-black text-[#47763A]">
                    {firstName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#332417]">
                      {name}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#8C7A65]">
                      Akun PUTARASA
                    </p>
                  </div>
                </div>

                <div className="my-2 h-px bg-[#EFE5D4]" />

                {/* JUDUL ROLE */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <ArrowRightLeft
                    size={15}
                    className="text-[#47763A]"
                  />

                  <p className="text-[11px] font-black uppercase tracking-wider text-[#8C7A65]">
                    Ganti Role
                  </p>
                </div>

                {/* ROLE BERDASARKAN DATABASE */}
                <div className="space-y-1">
                  {roles.map((role) => {
                    const info = getRoleInfo(role);
                    const Icon = info.icon;
                    const active =
                      role === currentRole;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() =>
                          switchRole(role)
                        }
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

                {/* LIHAT PROFIL */}
                <Link
                  href="/buyer/profil"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#332417] transition hover:bg-[#FFFBF1]"
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
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
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

      {/* CHATBOT FLOATING - TETAP SAMA */}
      <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
        {chatOpen && (
          <section
            role="dialog"
            aria-label="Asisten PUTARASA"
            className="mb-3 flex h-[380px] max-h-[65vh] w-[calc(100vw-40px)] max-w-[340px] flex-col overflow-hidden rounded-3xl border border-[#EDE5D6] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-[#47763A] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <Sprout size={22} />

                <div>
                  <p className="font-extrabold">
                    Asisten PUTARASA
                  </p>

                  <p className="text-xs text-white/75">
                    Bantuan belanja
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Tutup chatbot"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 bg-[#FFFBF1] p-5">
              <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-[#332417] shadow-sm">
                Halo! Selamat datang di PUTARASA 🌱

                <p className="mt-2 text-[#8C7A65]">
                  Butuh bantuan mencari produk?
                  Kamu bisa menjelajahi Marketplace.
                </p>
              </div>

              <Link
                href="/buyer/marketplace"
                onClick={() => setChatOpen(false)}
                className="mt-4 inline-flex rounded-xl bg-[#EAF3DF] px-4 py-2.5 text-sm font-bold text-[#47763A]"
              >
                Jelajahi Marketplace →
              </Link>
            </div>

            <div className="border-t border-[#EFE5D4] bg-white p-3 text-center text-xs text-[#8C7A65]">
              Fitur percakapan akan segera tersedia
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() =>
            setChatOpen((value) => !value)
          }
          aria-label={
            chatOpen
              ? "Tutup chatbot"
              : "Buka chatbot"
          }
          aria-expanded={chatOpen}
          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#47763A] text-white shadow-xl transition hover:scale-105 hover:bg-[#315F2E]"
        >
          {chatOpen ? (
            <X size={23} />
          ) : (
            <MessageCircle size={25} />
          )}
        </button>
      </div>
    </>
  );
}
