
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  History,
  MapPin,
  Package,
  Scale,
  Truck,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type PickupRequest = {
  id: string;
  pickup_date: string;
  pickup_time: string | null;
  waste_type: string;
  estimated_weight_kg: number;
  actual_weight_kg: number | null;
  address: string;
  status: string;
  courier_id: string | null;
  created_at: string;
};

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function getTodayWIB() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

function getStatusInfo(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
    case "requested":
      return {
        label: "Menunggu Konfirmasi",
        className: "bg-[#FFF0B0] text-[#80621C]",
      };

    case "approved":
    case "accepted":
    case "assigned":
    case "scheduled":
      return {
        label: "Dijadwalkan",
        className: "bg-[#E7F2F1] text-[#286A73]",
      };

    case "on_the_way":
    case "in_progress":
      return {
        label: "Dalam Proses",
        className: "bg-[#EEE8FA] text-[#7053A4]",
      };

    case "completed":
    case "picked_up":
      return {
        label: "Selesai",
        className: "bg-[#EAF3DF] text-[#47763A]",
      };

    case "cancelled":
    case "rejected":
      return {
        label: "Dibatalkan / Ditolak",
        className: "bg-red-50 text-red-700",
      };

    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-700",
      };
  }
}

const finishedStatuses = [
  "completed",
  "picked_up",
  "cancelled",
  "rejected",
];

function ScheduleCard({
  item,
}: {
  item: PickupRequest;
}) {
  const status = getStatusInfo(item.status);

  return (
    <article className="rounded-[24px] border border-[#EEE5D7] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0B0] text-[#47763A]">
            <CalendarDays size={26} />
          </div>

          <div>
            <p className="text-xs font-bold text-[#8C7A65]">
              Tanggal Penjemputan
            </p>

            <h3 className="mt-1 text-lg font-black text-[#332417]">
              {formatDate(item.pickup_date)}
            </h3>
          </div>
        </div>

        <span
          className={`inline-flex rounded-full px-3 py-2 text-xs font-black ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl bg-[#FFFBF1] p-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <Clock3
            size={19}
            className="shrink-0 text-[#47763A]"
          />
          <div>
            <p className="text-xs text-[#8C7A65]">
              Waktu
            </p>
            <p className="mt-1 text-sm font-black">
              {item.pickup_time
                ? `${item.pickup_time} WIB`
                : "Belum ditentukan"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Scale
            size={19}
            className="shrink-0 text-[#47763A]"
          />
          <div>
            <p className="text-xs text-[#8C7A65]">
              Estimasi Berat
            </p>
            <p className="mt-1 text-sm font-black">
              {numberFormat.format(
                Number(item.estimated_weight_kg)
              )}{" "}
              kg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Package
            size={19}
            className="shrink-0 text-[#47763A]"
          />
          <div>
            <p className="text-xs text-[#8C7A65]">
              Jenis Sampah
            </p>
            <p className="mt-1 text-sm font-black">
              {item.waste_type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Truck
            size={19}
            className="shrink-0 text-[#47763A]"
          />
          <div>
            <p className="text-xs text-[#8C7A65]">
              Penugasan Kurir
            </p>
            <p className="mt-1 text-sm font-black">
              {item.courier_id
                ? "Kurir telah ditugaskan"
                : "Belum ditugaskan"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#F0E8DC] p-4">
        <MapPin
          size={19}
          className="mt-0.5 shrink-0 text-[#47763A]"
        />
        <div>
          <p className="text-xs font-bold text-[#8C7A65]">
            Lokasi Penjemputan
          </p>
          <p className="mt-1 text-sm font-semibold leading-6">
            {item.address}
          </p>
        </div>
      </div>

      {item.status.toLowerCase() === "pending" && (
        <p className="mt-4 rounded-xl bg-[#FFF6D5] px-4 py-3 text-xs leading-5 text-[#80621C]">
          Permintaan sudah diajukan. Tanggal dan waktu
          yang ditampilkan masih menunggu konfirmasi.
        </p>
      )}

      {item.actual_weight_kg != null && (
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#47763A]">
          <CheckCircle2 size={18} />
          Berat aktual:{" "}
          {numberFormat.format(
            Number(item.actual_weight_kg)
          )}{" "}
          kg
        </div>
      )}
    </article>
  );
}

export default async function SupplierSchedulePage() {
  const { user } = await requireRole("supplier");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pickup_requests")
    .select(
      "id,pickup_date,pickup_time,waste_type,estimated_weight_kg,actual_weight_kg,address,status,courier_id,created_at"
    )
    .eq("supplier_id", user.id)
    .order("pickup_date", { ascending: true });

  const requests = (data ?? []) as PickupRequest[];
  const today = getTodayWIB();

  const upcoming = requests.filter(
    (item) =>
      item.pickup_date >= today &&
      !finishedStatuses.includes(
        item.status.toLowerCase()
      )
  );

  const pastOrFinished = requests
    .filter(
      (item) =>
        item.pickup_date < today ||
        finishedStatuses.includes(
          item.status.toLowerCase()
        )
    )
    .sort((a, b) =>
      b.pickup_date.localeCompare(a.pickup_date)
    );

  const pendingCount = upcoming.filter(
    (item) => item.status.toLowerCase() === "pending"
  ).length;

  const assignedCount = upcoming.filter(
    (item) => item.courier_id !== null
  ).length;

  const stats = [
    {
      label: "Jadwal Mendatang",
      value: upcoming.length,
      icon: CalendarDays,
      bg: "bg-[#FFF0B0]",
    },
    {
      label: "Menunggu Konfirmasi",
      value: pendingCount,
      icon: Clock3,
      bg: "bg-[#E7F2F1]",
    },
    {
      label: "Kurir Ditugaskan",
      value: assignedCount,
      icon: Truck,
      bg: "bg-[#EAF3DF]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFFBF1] text-[#332417]">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-[#8C7A65]">
          <Link
            href="/supplier/dashboard"
            className="hover:text-[#47763A]"
          >
            Supplier
          </Link>

          <ChevronRight size={15} />

          <span className="font-black text-[#47763A]">
            Jadwal
          </span>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-black text-[#47763A]">
                <CalendarClock size={16} />
                SUPPLIER SCHEDULE
              </span>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Jadwal Penjemputan
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#655221] sm:text-base">
                Pantau rencana penjemputan sampah
                organik, status permintaan, dan
                penugasan kurir di satu halaman.
              </p>

              <Link
                href="/supplier/penjemputan"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E]"
              >
                Ajukan Penjemputan
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-[30px] bg-[#47763A] text-white sm:flex">
              <CalendarDays size={58} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.bg}`}
                >
                  <Icon
                    size={25}
                    className="text-[#47763A]"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#8C7A65]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-black">
                    {error ? "—" : stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            Gagal memuat jadwal: {error.message}
          </div>
        )}

        {/* UPCOMING */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#47763A]">
                Rencana Penjemputan
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Jadwal Mendatang
              </h2>

              <p className="mt-2 text-sm text-[#8C7A65]">
                Termasuk permintaan yang masih
                menunggu konfirmasi.
              </p>
            </div>

            <span className="rounded-full bg-[#EAF3DF] px-4 py-2 text-xs font-black text-[#47763A]">
              {error ? "—" : upcoming.length} jadwal
            </span>
          </div>

          {!error && upcoming.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#DCD2C2] bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF3DF]">
                <CalendarDays
                  size={38}
                  className="text-[#47763A]"
                />
              </div>

              <h3 className="mt-5 text-xl font-black">
                Belum Ada Jadwal Mendatang
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#8C7A65]">
                Kamu belum memiliki permintaan
                penjemputan aktif untuk hari ini
                atau tanggal berikutnya.
              </p>

              <Link
                href="/supplier/penjemputan"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#47763A] px-6 py-3.5 text-sm font-black text-white"
              >
                Buat Permintaan
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {upcoming.map((item) => (
                <ScheduleCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* PAST SCHEDULE */}
        <section className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3DF]">
              <History
                size={24}
                className="text-[#47763A]"
              />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Jadwal Sebelumnya
              </h2>
              <p className="mt-1 text-xs text-[#8C7A65]">
                Jadwal yang telah lewat, selesai,
                atau dibatalkan.
              </p>
            </div>
          </div>

          {!error && pastOrFinished.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-[#FFFBF1] px-5 py-8 text-center text-sm text-[#8C7A65]">
              Belum ada jadwal sebelumnya.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {pastOrFinished.slice(0, 5).map((item) => {
                const status = getStatusInfo(item.status);

                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#F0E8DC] bg-[#FFFBF1] p-4"
                  >
                    <div>
                      <p className="font-black">
                        {item.waste_type}
                      </p>
                      <p className="mt-1 text-xs text-[#8C7A65]">
                        {formatShortDate(item.pickup_date)}
                        {" · "}
                        {numberFormat.format(
                          Number(item.estimated_weight_kg)
                        )}{" "}
                        kg
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href="/supplier/riwayat"
            className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#47763A] hover:underline"
          >
            Lihat Semua Riwayat
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
