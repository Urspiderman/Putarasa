
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Leaf,
  MapPin,
  MapPinned,
  PackageCheck,
  Recycle,
  Route,
  Sparkles,
  Truck,
  AlertCircle,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// ======================================================
// TYPES
// ======================================================

type PickupRow = {
  id: string;
  category: string | null;
  estimated_kg: number | null;
  actual_kg: number | null;
  address: string | null;
  scheduled_at: string | null;
  status: string;
};

type DeliveryRow = {
  id: string;
  order_code: string;
  customer_name: string;
  shipping_address: string | null;
  status: string;
  created_at: string;
};

type DashboardTask = {
  id: string;
  type: "pickup" | "delivery";
  title: string;
  subtitle: string;
  address: string;
  date: string | null;
  status: string;
};

// ======================================================
// HELPERS
// ======================================================

function formatDate(value: string | null) {
  if (!value) return "Belum dijadwalkan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    assigned: "Ditugaskan",
    accepted: "Diterima",
    scheduled: "Dijadwalkan",
    on_the_way: "Dalam Perjalanan",
    in_progress: "Dalam Proses",
    processing: "Siap Dikirim",
    shipped: "Sedang Dikirim",
    completed: "Selesai",
    picked_up: "Sudah Dijemput",
    cancelled: "Dibatalkan",
    rejected: "Ditolak",
  };

  return labels[status] ?? status.replace(/_/g, " ");
}

function getStatusClass(status: string) {
  if (
    status === "completed" ||
    status === "picked_up"
  ) {
    return "bg-[#E8F4E5] text-[#47763A]";
  }

  if (
    status === "shipped" ||
    status === "on_the_way" ||
    status === "in_progress"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    status === "cancelled" ||
    status === "rejected"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-[#FFF0B5] text-[#866500]";
}

function isCompleted(status: string) {
  return ["completed", "picked_up"].includes(status);
}

function isCancelled(status: string) {
  return ["cancelled", "rejected"].includes(status);
}

function isActive(status: string) {
  return !isCompleted(status) && !isCancelled(status);
}

// ======================================================
// PAGE
// ======================================================

export default async function CourierDashboardPage() {
  const { user } = await requireRole("courier");
  const supabase = await createClient();

  // ====================================================
  // FETCH DATA
  // ====================================================

  const [pickupsResult, deliveriesResult] =
    await Promise.all([
      supabase
        .from("pickups")
        .select(
          "id,category,estimated_kg,actual_kg,address,scheduled_at,status"
        )
        .eq("courier_id", user.id)
        .order("scheduled_at", {
          ascending: false,
        }),

      supabase
        .from("putarasa_orders")
        .select(
          "id,order_code,customer_name,shipping_address,status,created_at"
        )
        .eq("courier_id", user.id)
        .order("created_at", {
          ascending: false,
        }),
    ]);

  const errors = [
    pickupsResult.error,
    deliveriesResult.error,
  ].filter(Boolean);

  const pickups: PickupRow[] =
    pickupsResult.data ?? [];

  const deliveries: DeliveryRow[] =
    deliveriesResult.data ?? [];

  // ====================================================
  // NORMALIZE TASKS
  // ====================================================

  const pickupTasks: DashboardTask[] = pickups.map(
    (pickup) => ({
      id: `pickup-${pickup.id}`,
      type: "pickup",
      title: "Penjemputan Sampah Organik",
      subtitle:
        pickup.category || "Sampah Organik",
      address:
        pickup.address || "Alamat belum tersedia",
      date: pickup.scheduled_at,
      status: pickup.status,
    })
  );

  const deliveryTasks: DashboardTask[] =
    deliveries.map((delivery) => ({
      id: `delivery-${delivery.id}`,
      type: "delivery",
      title: `Pengantaran ${delivery.order_code}`,
      subtitle: delivery.customer_name,
      address:
        delivery.shipping_address ||
        "Alamat belum tersedia",
      date: delivery.created_at,
      status: delivery.status,
    }));

  const allTasks = [
    ...pickupTasks,
    ...deliveryTasks,
  ];

  // ====================================================
  // STATISTICS
  // ====================================================

  const totalPickup = pickups.length;
  const totalDelivery = deliveries.length;

  const activeTasks = allTasks.filter(
    (task) => isActive(task.status)
  );

  const completedTasks = allTasks.filter(
    (task) => isCompleted(task.status)
  );

  const activeCount = activeTasks.length;
  const completedCount = completedTasks.length;

  const totalTasks = allTasks.length;

  const completionRate =
    totalTasks > 0
      ? Math.round(
          (completedCount / totalTasks) * 100
        )
      : 0;

  // ====================================================
  // RECENT TASKS
  // ====================================================

  const recentTasks = [...activeTasks]
    .sort((a, b) => {
      const timeA = a.date
        ? new Date(a.date).getTime()
        : 0;

      const timeB = b.date
        ? new Date(b.date).getTime()
        : 0;

      return timeB - timeA;
    })
    .slice(0, 5);

  const todayLabel = new Intl.DateTimeFormat(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }
  ).format(new Date());

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-[#8C7A65]">
          <Link
            href="/courier/dashboard"
            className="hover:text-[#47763A]"
          >
            Kurir
          </Link>

          <ChevronRight size={15} />

          <span className="font-black text-[#47763A]">
            Dashboard
          </span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20" />
          <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-white/15" />

          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-xs font-black text-[#47763A]">
                <Sparkles size={15} />
                COURIER DASHBOARD
              </span>

              <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-[42px]">
                Halo, Kurir!
                <span className="block text-[#47763A]">
                  Siap Bergerak Hari Ini?
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#655221] sm:text-base">
                Kelola penjemputan sampah organik
                dan pengantaran produk PUTARASA
                dengan lebih mudah. Pantau tugas,
                lokasi tujuan, serta progres
                pekerjaanmu dalam satu tempat.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/courier/tugas"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
                >
                  Lihat Tugas Saya
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/courier/operasional"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#332417]/15 bg-white/70 px-6 py-3.5 text-sm font-black text-[#332417] transition hover:bg-white"
                >
                  <MapPinned size={18} />
                  Buka Peta
                </Link>
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="relative flex h-52 w-52 items-center justify-center rounded-[45px] bg-[#47763A] text-white shadow-[0_20px_40px_rgba(71,118,58,0.20)]">
                <Truck
                  size={110}
                  strokeWidth={1.3}
                />

                <div className="absolute -bottom-3 -left-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#47763A] shadow-lg">
                  <Leaf size={32} />
                </div>

                <div className="absolute -right-4 -top-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF6D6] text-[#47763A] shadow-lg">
                  <Recycle size={28} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATE */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Ringkasan Operasional
            </h2>

            <p className="mt-1 text-sm text-[#8C7A65]">
              Pantau aktivitas dan pencapaian tugasmu.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#EAE3D6] bg-white px-4 py-2.5 text-xs font-bold text-[#776957]">
            <CalendarDays size={16} />
            {todayLabel}
          </span>
        </div>

        {/* ERROR */}
        {errors.length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
          >
            <AlertCircle
              size={21}
              className="shrink-0 text-red-600"
            />

            <div>
              <p className="font-black text-red-700">
                Gagal Memuat Sebagian Data
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {errors
                  .map((error) => error?.message)
                  .join(" | ")}
              </p>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Penjemputan",
              value: totalPickup,
              subtitle: "Tugas sampah organik",
              icon: Leaf,
              color: "bg-[#E8F2DE] text-[#47763A]",
            },
            {
              title: "Total Pengantaran",
              value: totalDelivery,
              subtitle: "Pesanan Marketplace",
              icon: Truck,
              color: "bg-[#FFF0B5] text-[#866500]",
            },
            {
              title: "Tugas Aktif",
              value: activeCount,
              subtitle: "Masih perlu dikerjakan",
              icon: Clock3,
              color: "bg-blue-100 text-blue-700",
            },
            {
              title: "Tugas Selesai",
              value: completedCount,
              subtitle: "Pekerjaan terselesaikan",
              icon: CheckCircle2,
              color: "bg-green-100 text-green-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-[24px] border border-[#EAE3D6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-[#A99A85]"
                  />
                </div>

                <p className="mt-5 text-3xl font-black text-[#332417]">
                  {stat.value}
                </p>

                <h3 className="mt-2 text-sm font-black text-[#332417]">
                  {stat.title}
                </h3>

                <p className="mt-1 text-xs text-[#8C7A65]">
                  {stat.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* ACTIVE TASKS */}
          <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black">
                  <ClipboardList
                    size={22}
                    className="text-[#47763A]"
                  />
                  Tugas Aktif
                </h2>

                <p className="mt-1 text-sm text-[#8C7A65]">
                  Daftar pekerjaan yang perlu
                  diselesaikan.
                </p>
              </div>

              <Link
                href="/courier/tugas"
                className="inline-flex items-center gap-1.5 text-sm font-black text-[#47763A] hover:underline"
              >
                Semua Tugas
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAE3D6] bg-[#FFFBF1] px-5 py-12 text-center">
                  <PackageCheck
                    size={42}
                    className="text-[#47763A]"
                  />

                  <h3 className="mt-4 text-base font-black">
                    Tidak Ada Tugas Aktif
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#8C7A65]">
                    Semua tugas telah diselesaikan
                    atau belum ada tugas baru yang
                    diberikan oleh Admin.
                  </p>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-[#EFE8DC] bg-[#FFFEFB] p-4 transition hover:border-[#B9CEAD]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            task.type === "pickup"
                              ? "bg-[#E8F2DE] text-[#47763A]"
                              : "bg-[#FFF0B5] text-[#866500]"
                          }`}
                        >
                          {task.type === "pickup" ? (
                            <Leaf size={21} />
                          ) : (
                            <Truck size={21} />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-black text-[#332417]">
                            {task.title}
                          </p>

                          <p className="mt-1 text-xs text-[#8C7A65]">
                            {task.subtitle}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-black ${getStatusClass(
                          task.status
                        )}`}
                      >
                        {getStatusLabel(
                          task.status
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#EFE8DC] pt-3 text-xs text-[#776957]">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span className="max-w-[260px] truncate">
                          {task.address}
                        </span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDate(task.date)}
                      </span>

                      {task.type === "pickup" && (
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {formatTime(task.date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* PROGRESS + QUICK ACTIONS */}
          <div className="space-y-6">
            {/* PROGRESS */}
            <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Route
                  size={22}
                  className="text-[#47763A]"
                />

                <h2 className="text-lg font-black">
                  Progres Tugas
                </h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#8C7A65]">
                Persentase tugas yang berhasil
                diselesaikan.
              </p>

              <div className="mt-6 flex items-end justify-between">
                <span className="text-4xl font-black text-[#47763A]">
                  {completionRate}%
                </span>

                <span className="text-xs font-bold text-[#8C7A65]">
                  {completedCount} dari {totalTasks}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label="Progres tugas Kurir"
                aria-valuenow={completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-4 h-3 overflow-hidden rounded-full bg-[#E8ECDD]"
              >
                <div
                  className="h-full rounded-full bg-[#47763A] transition-all"
                  style={{
                    width: `${completionRate}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-xs leading-5 text-[#8C7A65]">
                Progres dihitung berdasarkan seluruh
                tugas yang tercatat.
              </p>
            </section>

            {/* QUICK ACTIONS */}
            <section className="rounded-[28px] bg-[#47763A] p-6 text-white shadow-sm">
              <h2 className="text-lg font-black">
                Akses Cepat
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/75">
                Buka fitur operasional yang kamu
                butuhkan.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  {
                    label: "Lihat Semua Tugas",
                    href: "/courier/tugas",
                    icon: ClipboardList,
                  },
                  {
                    label: "Peta Operasional",
                    href: "/courier/operasional",
                    icon: MapPinned,
                  },
                  {
                    label: "Riwayat Pekerjaan",
                    href: "/courier/riwayat",
                    icon: HistoryIcon,
                  },
                ].map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3.5 transition hover:bg-white/25"
                    >
                      <span className="flex items-center gap-3 text-sm font-bold">
                        <Icon size={18} />
                        {action.label}
                      </span>

                      <ArrowRight size={17} />
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <section className="flex flex-col items-start justify-between gap-5 rounded-[28px] border border-[#EAE3D6] bg-[#FFF4C9] p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#47763A] text-white">
              <MapPinned size={27} />
            </div>

            <div>
              <h2 className="text-lg font-black">
                Siap Menuju Lokasi Berikutnya?
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-[#776957]">
                Gunakan peta operasional untuk
                melihat lokasi penjemputan dan
                pengantaran produk.
              </p>
            </div>
          </div>

          <Link
            href="/courier/operasional"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#47763A] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
          >
            Buka Peta
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#EDE5D6] py-5 text-center text-xs text-[#9A8974]">
          PUTARASA — Courier Workspace
        </footer>
      </div>
    </main>
  );
}

// ======================================================
// LOCAL ICON
// ======================================================

function HistoryIcon({
  size = 18,
}: {
  size?: number;
}) {
  return <ClipboardList size={size} />;
}
