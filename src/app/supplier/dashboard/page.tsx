
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  Leaf,
  MapPin,
  PackageCheck,
  Recycle,
  Sprout,
  Truck,
  History,
  Store,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type PickupRequest = {
  id: string;
  pickup_date: string;
  pickup_time: string | null;
  waste_type: string;
  estimated_weight_kg: number | null;
  actual_weight_kg: number | null;
  address: string;
  status: string;
  created_at: string;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    requested: "Diajukan",
    approved: "Disetujui",
    assigned: "Kurir Ditugaskan",
    scheduled: "Dijadwalkan",
    accepted: "Diterima",
    on_the_way: "Dalam Perjalanan",
    in_progress: "Diproses",
    picked_up: "Sudah Dijemput",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    rejected: "Ditolak",
  };

  return labels[status.toLowerCase()] ?? status;
}

function statusStyle(status: string) {
  const value = status.toLowerCase();

  if (["completed", "picked_up"].includes(value)) {
    return "bg-[#EAF3DF] text-[#47763A]";
  }

  if (["cancelled", "rejected"].includes(value)) {
    return "bg-red-50 text-red-700";
  }

  if (
    [
      "scheduled",
      "assigned",
      "approved",
      "accepted",
      "on_the_way",
      "in_progress",
    ].includes(value)
  ) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-[#FFF0B0] text-[#80621C]";
}

const quickActions = [
  {
    title: "Penjemputan",
    description: "Ajukan dan pantau penjemputan sampah.",
    href: "/supplier/penjemputan",
    icon: Truck,
    background: "bg-[#FFF0B0]",
  },
  {
    title: "Jadwal",
    description: "Lihat jadwal penjemputan yang direncanakan.",
    href: "/supplier/jadwal",
    icon: CalendarDays,
    background: "bg-[#EAF3DF]",
  },
  {
    title: "Riwayat",
    description: "Tinjau aktivitas penjemputan sebelumnya.",
    href: "/supplier/riwayat",
    icon: History,
    background: "bg-[#E7F2F1]",
  },
  {
    title: "Marketplace",
    description: "Jelajahi produk ramah lingkungan.",
    href: "/supplier/marketplace",
    icon: Store,
    background: "bg-[#F5EAF2]",
  },
];

export default async function SupplierDashboardPage() {
  const { user } = await requireRole("supplier");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pickup_requests")
    .select(
      "id,pickup_date,pickup_time,waste_type,estimated_weight_kg,actual_weight_kg,address,status,created_at"
    )
    .eq("supplier_id", user.id)
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as PickupRequest[];

  const name =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "Supplier";

  const firstName = name.trim().split(/\s+/)[0] || "Supplier";

  const completedStatuses = ["completed", "picked_up"];
  const cancelledStatuses = ["cancelled", "rejected"];

  const completed = requests.filter((item) =>
    completedStatuses.includes(item.status.toLowerCase())
  );

  const active = requests.filter(
    (item) =>
      !completedStatuses.includes(item.status.toLowerCase()) &&
      !cancelledStatuses.includes(item.status.toLowerCase())
  );

  const totalCollected = completed.reduce(
    (total, item) =>
      total + Number(item.actual_weight_kg ?? 0),
    0
  );

  const totalEstimated = active.reduce(
    (total, item) =>
      total + Number(item.estimated_weight_kg ?? 0),
    0
  );

  // Gunakan tanggal YYYY-MM-DD sesuai zona Asia/Jakarta.
  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const upcoming = active
    .filter((item) => item.pickup_date >= today)
    .sort((a, b) =>
      a.pickup_date.localeCompare(b.pickup_date)
    )
    .slice(0, 3);

  const recent = requests.slice(0, 5);

  const stats = [
    {
      label: "Sampah Terkumpul",
      value: `${formatNumber(totalCollected)} kg`,
      description: "Berat aktual dari penjemputan selesai",
      icon: Recycle,
      color: "bg-[#EAF3DF]",
    },
    {
      label: "Total Permintaan",
      value: formatNumber(requests.length),
      description: "Seluruh permintaan penjemputan",
      icon: ClipboardList,
      color: "bg-[#FFF0B0]",
    },
    {
      label: "Penjemputan Aktif",
      value: formatNumber(active.length),
      description: "Belum selesai atau dibatalkan",
      icon: Truck,
      color: "bg-[#E7F2F1]",
    },
    {
      label: "Penjemputan Selesai",
      value: formatNumber(completed.length),
      description: "Permintaan berstatus selesai",
      icon: PackageCheck,
      color: "bg-[#F5EAF2]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-[#8C7A65]">
          <span>Supplier</span>
          <ChevronRight size={15} />
          <span className="font-extrabold text-[#47763A]">
            Dashboard
          </span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9 lg:p-11">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20" />
          <div className="absolute -bottom-28 right-20 h-60 w-60 rounded-full bg-[#F5C72D]/30" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_260px]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-black text-[#47763A]">
                <Leaf size={15} />
                SUPPLIER WORKSPACE
              </span>

              <h1 className="mt-6 text-3xl font-black leading-tight sm:text-4xl lg:text-[42px]">
                Halo, {firstName}! 👋
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#655221] sm:text-base">
                Pantau sampah organik yang telah
                dikumpulkan, kelola permintaan penjemputan,
                dan lihat perkembangan aktivitasmu
                bersama PUTARASA.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/supplier/penjemputan"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
                >
                  Kelola Penjemputan
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/supplier/riwayat"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#C6A53D] bg-white/60 px-6 py-3.5 text-sm font-black text-[#332417] transition hover:bg-white"
                >
                  Lihat Riwayat
                </Link>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <div className="flex h-[220px] w-[220px] items-center justify-center rounded-full border-[16px] border-white/40 bg-[#FFF1AF]">
                <div className="flex h-[145px] w-[145px] items-center justify-center rounded-full bg-[#47763A] shadow-xl">
                  <Recycle
                    size={78}
                    strokeWidth={1.5}
                    className="text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATABASE ERROR */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            <p className="font-black">
              Data Dashboard Gagal Dimuat
            </p>
            <p className="mt-2">{error.message}</p>
            <p className="mt-2">
              Periksa kebijakan RLS dan izin SELECT
              pada tabel pickup_requests.
            </p>
          </div>
        )}

        {/* STATISTICS */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#47763A]">
              Ringkasan Aktivitas
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Statistik Penjemputan
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
                  >
                    <Icon
                      size={24}
                      className="text-[#47763A]"
                    />
                  </div>

                  <p className="mt-5 text-sm font-bold text-[#8C7A65]">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {error ? "—" : stat.value}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#9A8974]">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#47763A]">
              Akses Cepat
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Mau Melakukan Apa Hari Ini?
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group rounded-[24px] border border-[#EFE5D4] p-6 transition hover:-translate-y-1 hover:shadow-lg ${action.background}`}
                >
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/65 p-3">
                    <Icon
                      size={26}
                      className="text-[#47763A]"
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    {action.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#74695B]">
                    {action.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-black text-[#47763A]">
                    Buka Halaman
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ACTIVITY AND SCHEDULE */}
        <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          {/* RECENT ACTIVITY */}
          <div className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">
                  Aktivitas Terbaru
                </h2>
                <p className="mt-1 text-xs text-[#8C7A65]">
                  Lima permintaan penjemputan terbaru.
                </p>
              </div>

              <Clock3
                size={23}
                className="text-[#47763A]"
              />
            </div>

            {recent.length === 0 ? (
              <div className="mt-7 rounded-2xl border border-dashed border-[#D9D2C4] bg-[#FFFBF1] px-5 py-12 text-center">
                <Recycle
                  size={34}
                  className="mx-auto text-[#47763A]"
                />
                <h3 className="mt-4 font-black">
                  Belum Ada Aktivitas
                </h3>
                <p className="mt-2 text-sm text-[#8C7A65]">
                  Permintaan penjemputanmu akan tampil
                  di sini.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F0E8DC] bg-[#FFFBF1] p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-black">
                        {item.waste_type}
                      </p>
                      <p className="mt-1 text-xs text-[#8C7A65]">
                        {formatDateTime(item.created_at)}
                        {" · "}
                        {formatNumber(
                          Number(item.estimated_weight_kg ?? 0)
                        )}{" "}
                        kg estimasi
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-[11px] font-black ${statusStyle(
                        item.status
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/supplier/riwayat"
              className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#47763A] hover:underline"
            >
              Lihat Semua Riwayat
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* UPCOMING SCHEDULE */}
          <div className="rounded-[26px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Jadwal Mendatang
                </h2>
                <p className="mt-1 text-xs text-[#8C7A65]">
                  Permintaan aktif dengan jadwal terdekat.
                </p>
              </div>

              <CalendarDays
                size={23}
                className="text-[#47763A]"
              />
            </div>

            {upcoming.length === 0 ? (
              <div className="mt-7 rounded-2xl bg-[#EAF3DF] px-5 py-10 text-center">
                <CalendarDays
                  size={32}
                  className="mx-auto text-[#47763A]"
                />
                <h3 className="mt-4 font-black">
                  Belum Ada Jadwal
                </h3>
                <p className="mt-2 text-sm text-[#74695B]">
                  Belum ada permintaan aktif dengan
                  tanggal penjemputan mendatang.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#E8EEDC] bg-[#F5FAF0] p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-black text-[#47763A]">
                      <CalendarDays size={17} />
                      {formatDate(item.pickup_date)}
                    </div>

                    <p className="mt-2 text-sm font-bold">
                      {item.waste_type}
                    </p>

                    <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#74695B]">
                      <MapPin size={15} className="shrink-0" />
                      {item.address}
                    </p>

                    {item.pickup_time && (
                      <p className="mt-2 text-xs text-[#74695B]">
                        Waktu: {item.pickup_time}
                      </p>
                    )}

                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${statusStyle(
                        item.status
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-[#FFF0B0] p-4">
              <p className="text-xs font-bold text-[#80621C]">
                Estimasi sampah dari permintaan aktif
              </p>
              <p className="mt-2 text-2xl font-black">
                {error
                  ? "—"
                  : `${formatNumber(totalEstimated)} kg`}
              </p>
            </div>

            <Link
              href="/supplier/jadwal"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#47763A] hover:underline"
            >
              Lihat Semua Jadwal
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ENVIRONMENTAL NOTE */}
        <section className="flex flex-col items-start justify-between gap-5 rounded-[26px] bg-[#47763A] p-7 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <Sprout size={28} />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Kontribusimu untuk Lingkungan
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Setiap sampah organik yang berhasil
                dikumpulkan dapat mendukung proses
                pengolahan yang lebih berkelanjutan.
              </p>
            </div>
          </div>

          <Link
            href="/supplier/dampak"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#FFDA57] px-5 py-3.5 text-sm font-black text-[#332417]"
          >
            Lihat Dampak
            <ArrowRight size={17} />
          </Link>
        </section>

        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Supplier Workspace
        </footer>
      </div>
    </main>
  );
}
