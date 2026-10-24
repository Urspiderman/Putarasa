
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
  Sparkles,
  Recycle,
  ArrowUpRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Role = "buyer" | "admin" | "supplier" | "courier";

type RoleItem = {
  role: Role;
  title: string;
  description: string;
  href: string;
  number: string;
  icon: typeof ShoppingBag;
  accent: string;
  iconBg: string;
  border: string;
  glow: string;
  detail: string;
};

const roleItems: RoleItem[] = [
  {
    role: "buyer",
    title: "Buyer",
    description:
      "Temukan produk organik berkualitas dan dukung ekonomi sirkular.",
    href: "/buyer/dashboard",
    number: "01",
    icon: ShoppingBag,
    accent: "#B98220",
    iconBg: "#FFF0CA",
    border: "#F0DEB8",
    glow: "#FFF3D8",
    detail: "Marketplace organik",
  },
  {
    role: "admin",
    title: "Admin",
    description:
      "Kelola seluruh operasional, pengguna, transaksi, dan dampak lingkungan.",
    href: "/admin/dashboard",
    number: "02",
    icon: ShieldCheck,
    accent: "#4C713C",
    iconBg: "#E6F0DF",
    border: "#D9E6D2",
    glow: "#ECF5E6",
    detail: "Pusat kendali sistem",
  },
  {
    role: "supplier",
    title: "Supplier",
    description:
      "Kelola sampah organik dan jadwalkan penjemputan dengan mudah.",
    href: "/supplier/dashboard",
    number: "03",
    icon: Sprout,
    accent: "#478D64",
    iconBg: "#E0F2E7",
    border: "#D4EBDD",
    glow: "#EAF8EE",
    detail: "Kontribusi lingkungan",
  },
  {
    role: "courier",
    title: "Courier",
    description:
      "Atur tugas penjemputan, pantau perjalanan, dan catat hasil pengumpulan.",
    href: "/courier/dashboard",
    number: "04",
    icon: Truck,
    accent: "#AD7539",
    iconBg: "#F9EAD8",
    border: "#F0DFC9",
    glow: "#FFF1E3",
    detail: "Operasional penjemputan",
  },
];

export default async function SelectRolePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const [{ data: profile }, { data: userRoles, error: roleError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id),
    ]);

  const fullName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Pengguna";

  const firstName = fullName.split(" ")[0];

  const activeRoles = new Set(
    (userRoles ?? []).map((item) => item.role as Role)
  );

  const availableRoles = roleItems.filter((item) =>
    activeRoles.has(item.role)
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFBF4] text-[#332417]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-48 top-20 h-[450px] w-[450px] rounded-full bg-[#FFE7A2]/30 blur-[110px]" />
      <div className="pointer-events-none absolute -right-40 top-[300px] h-[450px] w-[450px] rounded-full bg-[#CFE7C2]/30 blur-[110px]" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(#6C573A 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#FFCC24] shadow-[0_8px_20px_rgba(255,204,36,0.25)] transition-transform group-hover:rotate-[-8deg]">
              <Leaf
                size={25}
                strokeWidth={2.5}
                className="text-[#315C31]"
              />
            </div>

            <div>
              <div className="text-xl font-black tracking-[-0.8px]">
                PUTARASA
              </div>
              <div className="text-[10px] font-semibold tracking-[0.14em] text-[#8D806B]">
                DARI DAPUR, UNTUK BUMI
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-[#E8E5D9] bg-white/85 px-4 py-2 text-xs font-semibold text-[#527346] shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#65AA54]" />
            Workspace Selection
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-3xl pb-10 pt-16 text-center sm:pt-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8EBD8] bg-[#F1F6E9] px-4 py-2 text-xs font-bold text-[#527346]">
            <Sparkles size={14} />
            SELAMAT DATANG KEMBALI
          </div>

          <h1 className="text-[34px] font-black leading-[1.12] tracking-[-1.6px] sm:text-5xl lg:text-[56px]">
            Halo, {firstName}!{" "}
            <span className="inline-block origin-bottom animate-[wave_2.5s_ease-in-out_infinite]">
              👋
            </span>
          </h1>

          <h2 className="mt-3 text-[30px] font-black leading-tight tracking-[-1.3px] text-[#47763A] sm:text-[44px]">
            Mau berkontribusi sebagai apa?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#857967] sm:text-base">
            Satu akun, banyak cara untuk membuat perubahan.
            Pilih workspace sesuai peranmu dan mulai perjalanan
            menuju masa depan yang lebih berkelanjutan.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#EEE5D7] bg-white px-4 py-2 text-xs font-semibold text-[#73654F] shadow-sm">
              <CheckCircle2 size={15} className="text-[#5E9B50]" />
              {availableRoles.length} Role Aktif
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#EEE5D7] bg-white px-4 py-2 text-xs font-semibold text-[#73654F] shadow-sm">
              <Recycle size={15} className="text-[#5E9B50]" />
              Satu Ekosistem PUTARASA
            </div>
          </div>
        </section>

        {/* Workspace cards */}
        {roleError ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
            Gagal memuat role akun: {roleError.message}
          </div>
        ) : availableRoles.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-[#EFE6D8] bg-white p-8 text-center shadow-sm">
            <ShieldCheck
              size={34}
              className="mx-auto mb-4 text-[#47763A]"
            />
            <h3 className="text-xl font-extrabold">
              Belum ada workspace aktif
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#857967]">
              Akunmu belum memiliki role aktif.
              Hubungi admin untuk mendapatkan akses.
            </p>
          </div>
        ) : (
          <div
            className={`mx-auto grid max-w-[1000px] gap-5 ${
              availableRoles.length === 1
                ? "max-w-[500px] grid-cols-1"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {availableRoles.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.role}
                  href={item.href}
                  className="group relative flex min-h-[245px] flex-col overflow-hidden rounded-[28px] border bg-white p-7 shadow-[0_8px_35px_rgba(73,54,26,0.035)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(73,54,26,0.10)] sm:p-8"
                  style={{ borderColor: item.border }}
                >
                  {/* Background decoration */}
                  <div
                    className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full opacity-60 transition-transform duration-500 group-hover:scale-125"
                    style={{ backgroundColor: item.glow }}
                  />

                  <div className="relative flex items-start justify-between">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-[21px] transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105"
                      style={{ backgroundColor: item.iconBg }}
                    >
                      <Icon
                        size={30}
                        strokeWidth={1.9}
                        style={{ color: item.accent }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-[#E5EBDC] bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#568448]">
                        Aktif
                      </span>
                      <span className="text-xs font-black text-[#C7BDAE]">
                        {item.number}
                      </span>
                    </div>
                  </div>

                  <div className="relative mt-6 flex-1">
                    <h3 className="text-[24px] font-black tracking-[-0.7px]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#887A67]">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between border-t border-[#F2EDE4] pt-5">
                    <span className="text-xs font-semibold text-[#9B8C78]">
                      {item.detail}
                    </span>

                    <div
                      className="flex items-center gap-2 text-sm font-extrabold transition-all group-hover:gap-3"
                      style={{ color: item.accent }}
                    >
                      Masuk Workspace
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: item.iconBg }}
                      >
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom information */}
        <div className="mx-auto mt-12 flex max-w-[1000px] flex-col items-center justify-between gap-4 border-t border-[#EDE5D9] pt-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2 text-xs text-[#9A8C78]">
            <Leaf size={15} className="text-[#6C9959]" />
            Setiap peran punya dampak untuk bumi.
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#8D806B]">
            Powered by
            <span className="font-black text-[#47763A]">PUTARASA</span>
            <ArrowRight size={14} />
            Circular Economy
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          15%, 35% { transform: rotate(15deg); }
          25%, 45% { transform: rotate(-8deg); }
          55% { transform: rotate(0deg); }
        }
      `}</style>
    </main>
  );
}
