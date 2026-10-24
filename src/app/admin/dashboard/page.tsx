
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  Recycle,
  ShoppingCart,
  Truck,
  Users,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Application = {
  id: string;
  requested_role: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [
    profilesResult,
    rolesResult,
    applicationsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("user_roles")
      .select("user_id, role"),

    supabase
      .from("role_applications")
      .select("id, requested_role, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const roles = rolesResult.data ?? [];
  const applications = (
    applicationsResult.data ?? []
  ) as Application[];

  const totalUsers = profilesResult.count ?? 0;

  const totalSuppliers = roles.filter(
    (item) => item.role === "supplier"
  ).length;

  const totalCouriers = roles.filter(
    (item) => item.role === "courier"
  ).length;

  const totalBuyers = roles.filter(
    (item) => item.role === "buyer"
  ).length;

  const pending = applications.filter(
    (item) => item.status === "pending"
  ).length;

  const approved = applications.filter(
    (item) => item.status === "approved"
  ).length;

  const rejected = applications.filter(
    (item) => item.status === "rejected"
  ).length;

  const latestApplications = applications.slice(0, 5);

  const hasError = Boolean(
    profilesResult.error ||
    rolesResult.error ||
    applicationsResult.error
  );

  const stats = [
    {
      title: "Total Pengguna",
      value: totalUsers,
      icon: Users,
      color: "text-[#8C6500]",
      background: "bg-[#FFF1C6]",
      description: "Akun yang terdaftar",
    },
    {
      title: "Supplier Aktif",
      value: totalSuppliers,
      icon: Recycle,
      color: "text-[#528339]",
      background: "bg-[#E8F3DD]",
      description: "Role supplier aktif",
    },
    {
      title: "Courier Aktif",
      value: totalCouriers,
      icon: Truck,
      color: "text-[#537DAD]",
      background: "bg-[#E5F0FC]",
      description: "Role courier aktif",
    },
    {
      title: "Buyer Aktif",
      value: totalBuyers,
      icon: ShoppingCart,
      color: "text-[#A46B80]",
      background: "bg-[#FBE8EE]",
      description: "Role buyer aktif",
    },
  ];

  const quickAccess = [
    {
      title: "Verifikasi Akun",
      description: "Tinjau pengajuan Supplier dan Courier.",
      href: "/admin/verifikasi",
      icon: ClipboardCheck,
    },
    {
      title: "Penjemputan",
      description: "Kelola permintaan penjemputan organik.",
      href: "/admin/penjemputan",
      icon: Truck,
    },
    {
      title: "Pengolahan",
      description: "Pantau proses pengolahan sampah.",
      href: "/admin/pengolahan",
      icon: Recycle,
    },
    {
      title: "Produk",
      description: "Kelola produk hasil pengolahan.",
      href: "/admin/produk",
      icon: Package,
    },
  ];

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 lg:px-10">
      {/* HEADER */}
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#A37B1A]">
            <LayoutDashboard size={17} />
            Admin Dashboard
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Halo,{" "}
            <span className="text-[#B88A08]">
              {user.user_metadata?.full_name || "Admin"}!
            </span>
          </h1>

          <p className="mt-2 text-sm leading-7 text-[#817361]">
            Selamat datang di pusat pengelolaan PUTARASA.
            Pantau aktivitas dan kelola operasional dalam satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#EFE4D2] bg-white px-4 py-3 text-sm font-semibold text-[#746552]">
            <CalendarDays size={18} className="text-[#A8862A]" />
            {new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            }).format(new Date())}
          </div>

          <Link
            href="/admin/verifikasi"
            aria-label="Lihat pengajuan akun"
            className="relative rounded-xl border border-[#EFE4D2] bg-white p-3"
          >
            <Bell size={20} />
            {pending > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#FFF0B9] p-7 sm:p-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#FFDA67]/40" />
        <div className="absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-[#F6D269]/35" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-[#866100]">
              <Recycle size={15} />
              Dari Dapur, Untuk Bumi
            </div>

            <h2 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">
              Kelola Ekosistem Organik
              <span className="block text-[#66843A]">
                dengan Lebih Mudah.
              </span>
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-[#736041]">
              Pantau pendaftaran mitra, aktivitas operasional,
              serta perkembangan layanan PUTARASA melalui dashboard ini.
            </p>

            <Link
              href="/admin/verifikasi"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#332417] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#503A28]"
            >
              Kelola Pengajuan
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="flex shrink-0 items-center justify-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-white/60 bg-[#E4F0CF] sm:h-44 sm:w-44">
              <Recycle
                size={82}
                strokeWidth={1.5}
                className="text-[#628B41]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DATA ERROR */}
      {hasError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          Sebagian statistik belum dapat dimuat dari Supabase.
          Periksa izin RLS untuk Admin dan koneksi database.
        </div>
      )}

      {/* STATISTIK */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Ringkasan Pengguna
            </h2>
            <p className="mt-1 text-sm text-[#8A7B67]">
              Data akun dan role yang tercatat di Supabase.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[22px] border border-[#EFE5D6] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 ${item.background} ${item.color}`}
                  >
                    <Icon size={24} />
                  </div>
                </div>

                <p className="mt-6 text-sm font-semibold text-[#817361]">
                  {item.title}
                </p>

                <p className="mt-2 text-3xl font-black">
                  {hasError ? "—" : item.value}
                </p>

                <p className="mt-2 text-xs text-[#A09483]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PENGAJUAN */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-[24px] border border-[#EFE5D6] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#F0E9DD] p-6">
            <div>
              <h2 className="text-lg font-black">
                Pengajuan Terbaru
              </h2>
              <p className="mt-1 text-xs text-[#8A7B67]">
                Pendaftaran Supplier dan Courier.
              </p>
            </div>

            <Link
              href="/admin/verifikasi"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#A77A00]"
            >
              Lihat Semua <ArrowRight size={15} />
            </Link>
          </div>

          {applicationsResult.error ? (
            <p className="p-8 text-sm text-red-700">
              Pengajuan belum dapat dimuat.
            </p>
          ) : latestApplications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardCheck
                size={40}
                className="mx-auto text-[#D6B76C]"
              />
              <p className="mt-4 font-bold">
                Belum Ada Pengajuan
              </p>
              <p className="mt-2 text-sm text-[#8A7B67]">
                Pengajuan baru akan tampil di sini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0E9DD]">
              {latestApplications.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-bold capitalize">
                      Pengajuan {item.requested_role}
                    </p>
                    <p className="mt-1 text-xs text-[#8A7B67]">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      item.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : item.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status === "approved"
                      ? "Disetujui"
                      : item.status === "rejected"
                      ? "Ditolak"
                      : "Menunggu"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-[#EFE5D6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">
            Status Verifikasi
          </h2>
          <p className="mt-1 text-xs text-[#8A7B67]">
            Ringkasan seluruh pengajuan.
          </p>

          <div className="mt-7 space-y-5">
            {[
              {
                label: "Menunggu",
                value: pending,
                icon: Clock3,
                color: "text-amber-600",
              },
              {
                label: "Disetujui",
                value: approved,
                icon: CheckCircle2,
                color: "text-green-600",
              },
              {
                label: "Ditolak",
                value: rejected,
                icon: XCircle,
                color: "text-red-600",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} className={item.color} />
                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-lg font-black">
                    {applicationsResult.error
                      ? "—"
                      : item.value}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            href="/admin/verifikasi"
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#FFF0BB] px-4 py-3 text-sm font-bold text-[#8A6500]"
          >
            Buka Verifikasi
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* AKSES CEPAT */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-black sm:text-2xl">
            Akses Cepat
          </h2>
          <p className="mt-1 text-sm text-[#8A7B67]">
            Menu operasional yang sering digunakan Admin.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickAccess.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[22px] border border-[#EFE5D6] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#E9BE49] hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2CB] text-[#9A7200]">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 font-black">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-xs leading-6 text-[#8A7B67]">
                  {item.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#A77A00]">
                  Buka Menu
                  <ArrowRight
                    size={15}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-[#EFE5D6] pt-6 text-center text-xs text-[#A09483]">
        © PUTARASA — Dari Dapur, Untuk Bumi.
      </footer>
    </main>
  );
}
