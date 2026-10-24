
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  ClipboardList,
  MapPin,
  PackageCheck,
  Recycle,
  Scale,
  Truck,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PickupRequestForm from "@/components/supplier/PickupRequestForm";

type PickupRequest = {
  id: string;
  waste_type: string;
  estimated_weight_kg: number | null;
  actual_weight_kg: number | null;
  pickup_date: string;
  pickup_time: string | null;
  address: string;
  status: string;
  created_at: string;
};

function formatWeight(value: number | null) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function getStatus(status: string) {
  const value = status.toLowerCase();

  if (["completed", "picked_up"].includes(value)) {
    return {
      label: "Selesai",
      className: "bg-[#EAF3DF] text-[#47763A]",
    };
  }

  if (["cancelled", "rejected"].includes(value)) {
    return {
      label: "Dibatalkan / Ditolak",
      className: "bg-red-50 text-red-700",
    };
  }

  if (
    [
      "scheduled",
      "approved",
      "assigned",
      "accepted",
    ].includes(value)
  ) {
    return {
      label: "Dijadwalkan",
      className: "bg-blue-50 text-blue-700",
    };
  }

  if (
    ["in_progress", "on_the_way"].includes(value)
  ) {
    return {
      label: "Dalam Proses",
      className: "bg-purple-50 text-purple-700",
    };
  }

  if (["pending", "requested"].includes(value)) {
    return {
      label: "Menunggu",
      className: "bg-[#FFF0B0] text-[#80621C]",
    };
  }

  return {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
}

export default async function SupplierPickupPage() {
  const { user } = await requireRole("supplier");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pickup_requests")
    .select(
      "id,waste_type,estimated_weight_kg,actual_weight_kg,pickup_date,pickup_time,address,status,created_at"
    )
    .eq("supplier_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const requests = (data ?? []) as PickupRequest[];

  const completedStatuses = ["completed", "picked_up"];
  const cancelledStatuses = ["cancelled", "rejected"];

  const completedCount = requests.filter((item) =>
    completedStatuses.includes(item.status.toLowerCase())
  ).length;

  const activeCount = requests.filter(
    (item) =>
      !completedStatuses.includes(item.status.toLowerCase()) &&
      !cancelledStatuses.includes(item.status.toLowerCase())
  ).length;

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

          <span className="font-extrabold text-[#47763A]">
            Penjemputan
          </span>
        </div>

        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#FFDA57] p-7 sm:p-9 lg:p-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/20" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-black text-[#47763A]">
                <Recycle size={16} />
                PENGELOLAAN SAMPAH ORGANIK
              </span>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                Penjemputan Sampah
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#655221] sm:text-base">
                Ajukan penjemputan sampah organik
                dengan mudah, lalu pantau perkembangan
                permintaanmu di satu tempat.
              </p>
            </div>

            <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-[30px] bg-[#47763A] text-white shadow-lg sm:flex">
              <Truck size={58} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Permintaan",
              value: requests.length,
              icon: ClipboardList,
              background: "bg-[#FFF0B0]",
            },
            {
              label: "Masih Aktif",
              value: activeCount,
              icon: Clock3,
              background: "bg-[#E7F2F1]",
            },
            {
              label: "Selesai",
              value: completedCount,
              icon: PackageCheck,
              background: "bg-[#EAF3DF]",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-[24px] border border-[#EFE5D4] bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.background}`}
                >
                  <Icon
                    size={25}
                    className="text-[#47763A]"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#8C7A65]">
                    {item.label}
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {error ? "—" : item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* MAIN CONTENT */}
        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {/* FORM */}
          <div className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
            <PickupRequestForm />
          </div>

          {/* LIST */}
          <div className="rounded-[28px] border border-[#EFE5D4] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#47763A]">
                  Aktivitas Supplier
                </p>

                <h2 className="mt-2 text-xl font-black sm:text-2xl">
                  Daftar Penjemputan
                </h2>

                <p className="mt-2 text-xs text-[#8C7A65]">
                  Menampilkan hingga 50 permintaan terbaru.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3DF]">
                <ClipboardList
                  size={24}
                  className="text-[#47763A]"
                />
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
              >
                <p className="font-black">
                  Gagal Memuat Permintaan
                </p>
                <p className="mt-2">{error.message}</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="mt-7 rounded-[24px] border border-dashed border-[#DDD4C6] bg-[#FFFBF1] px-6 py-14 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF3DF]">
                  <Truck
                    size={37}
                    className="text-[#47763A]"
                  />
                </div>

                <h3 className="mt-5 text-lg font-black">
                  Belum Ada Penjemputan
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#8C7A65]">
                  Isi formulir di samping untuk
                  mengajukan penjemputan sampah organik
                  pertamamu.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {requests.map((item) => {
                  const status = getStatus(item.status);

                  return (
                    <article
                      key={item.id}
                      className="rounded-[22px] border border-[#EFE5D4] bg-[#FFFBF1] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3DF]">
                            <Recycle
                              size={22}
                              className="text-[#47763A]"
                            />
                          </div>

                          <div>
                            <h3 className="font-black">
                              {item.waste_type}
                            </h3>
                            <p className="mt-1 text-xs text-[#8C7A65]">
                              {formatDate(item.pickup_date)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-[#74695B]">
                          <Scale
                            size={17}
                            className="text-[#47763A]"
                          />
                          Estimasi{" "}
                          <strong className="text-[#332417]">
                            {formatWeight(
                              item.estimated_weight_kg
                            )}{" "}
                            kg
                          </strong>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#74695B]">
                          <CalendarDays
                            size={17}
                            className="text-[#47763A]"
                          />
                          {formatDate(item.pickup_date)}
                        </div>

                        {item.pickup_time && (
                          <div className="flex items-center gap-2 text-sm text-[#74695B]">
                            <Clock3
                              size={17}
                              className="text-[#47763A]"
                            />
                            {item.pickup_time}
                          </div>
                        )}

                        {item.actual_weight_kg != null && (
                          <div className="flex items-center gap-2 text-sm text-[#74695B]">
                            <PackageCheck
                              size={17}
                              className="text-[#47763A]"
                            />
                            Aktual{" "}
                            <strong className="text-[#332417]">
                              {formatWeight(
                                item.actual_weight_kg
                              )}{" "}
                              kg
                            </strong>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-start gap-2 border-t border-[#EDE5D6] pt-4 text-xs leading-6 text-[#8C7A65]">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-[#47763A]"
                        />
                        <span>{item.address}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <Link
              href="/supplier/riwayat"
              className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#47763A] hover:underline"
            >
              Buka Riwayat
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <div className="rounded-[24px] bg-[#47763A] p-6 text-white sm:p-7">
          <div className="flex items-center gap-4">
            <Recycle size={35} className="shrink-0" />

            <div>
              <h3 className="text-lg font-black">
                Dari Dapur, Untuk Bumi
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Dengan memisahkan dan menyetorkan
                sampah organik, kamu ikut mendukung
                pengelolaan sumber daya yang lebih
                berkelanjutan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
