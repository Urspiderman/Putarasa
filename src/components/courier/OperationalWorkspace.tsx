
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  MapPinned,
  Navigation,
  PackageCheck,
  RefreshCw,
  Truck,
  AlertTriangle,
  Leaf,
} from "lucide-react";

import type {
  CourierPickup,
  CourierDelivery,
} from "@/app/courier/operasional/page";

import type { OperationalLocation } from "./OperationalMap";

import { updateCourierDeliveryStatus } from
  "@/app/courier/operasional/actions";

// ======================================================
// DYNAMIC MAP
// ======================================================

const OperationalMap = dynamic(
  () => import("./OperationalMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-3xl bg-[#F2ECDD]">
        <div className="flex flex-col items-center gap-3 text-[#47763A]">
          <RefreshCw
            size={28}
            className="animate-spin"
          />
          <p className="text-sm font-bold">
            Memuat peta operasional...
          </p>
        </div>
      </div>
    ),
  }
);

// ======================================================
// TYPES
// ======================================================

type Filter = "all" | "pickup" | "delivery";

type TaskType = "pickup" | "delivery";

type Task = {
  id: string;
  type: TaskType;
  title: string;
  subtitle: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  scheduledAt: string | null;
  detail: string;
};

type Props = {
  pickups: CourierPickup[];
  deliveries: CourierDelivery[];
};

// ======================================================
// HELPERS
// ======================================================

function isValidCoordinate(
  latitude: number | null,
  longitude: number | null
): boolean {
  return (
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function formatDate(value: string | null) {
  if (!value) return "Belum dijadwalkan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatWeight(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value)} kg`;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    assigned: "Ditugaskan",
    accepted: "Diterima",
    scheduled: "Dijadwalkan",
    on_the_way: "Dalam Perjalanan",
    in_progress: "Sedang Diproses",
    processing: "Siap Dikirim",
    shipped: "Dalam Pengiriman",
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
    return "bg-green-100 text-green-700";
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

  return "bg-amber-100 text-amber-800";
}

function getGoogleMapsUrl(
  latitude: number,
  longitude: number
) {
  return (
    "https://www.google.com/maps/dir/?api=1" +
    `&destination=${latitude},${longitude}`
  );
}

// ======================================================
// COMPONENT
// ======================================================

export default function OperationalWorkspace({
  pickups,
  deliveries,
}: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<
    string | null
  >(null);

  const [pending, startTransition] = useTransition();

  const [notice, setNotice] = useState("");
  const [noticeSuccess, setNoticeSuccess] =
    useState(true);

  // ====================================================
  // NORMALIZE PICKUPS + DELIVERIES
  // ====================================================

  const tasks = useMemo<Task[]>(() => {
    const pickupTasks: Task[] = pickups.map((pickup) => {
      const weight =
        pickup.actual_kg ?? pickup.estimated_kg;

      return {
        id: `pickup-${pickup.id}`,
        type: "pickup",
        title: "Penjemputan Sampah Organik",
        subtitle:
          pickup.category || "Sampah Organik",
        address: pickup.address,
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        status: pickup.status,
        scheduledAt: pickup.scheduled_at,
        detail: `Berat: ${formatWeight(weight)}`,
      };
    });

    const deliveryTasks: Task[] = deliveries.map(
      (delivery) => ({
        id: `delivery-${delivery.id}`,
        type: "delivery",
        title: `Pengantaran ${delivery.order_code}`,
        subtitle: delivery.customer_name,
        address: delivery.shipping_address,
        latitude: delivery.delivery_latitude,
        longitude: delivery.delivery_longitude,
        status: delivery.status,
        scheduledAt: delivery.created_at,
        detail: delivery.customer_phone
          ? `Penerima: ${delivery.customer_name} · ${delivery.customer_phone}`
          : `Penerima: ${delivery.customer_name}`,
      })
    );

    return [...pickupTasks, ...deliveryTasks];
  }, [pickups, deliveries]);

  // ====================================================
  // FILTER TASKS
  // ====================================================

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;

    return tasks.filter(
      (task) => task.type === filter
    );
  }, [tasks, filter]);

  // ====================================================
  // MAP LOCATIONS
  // ====================================================

  const locations = useMemo<OperationalLocation[]>(
    () =>
      filteredTasks
        .filter((task) =>
          isValidCoordinate(
            task.latitude,
            task.longitude
          )
        )
        .map((task) => ({
          id: task.id,
          title: task.title,
          address:
            task.address ?? "Alamat belum tersedia",
          type: task.type,
          latitude: Number(task.latitude),
          longitude: Number(task.longitude),
        })),
    [filteredTasks]
  );

  const missingCoordinates = filteredTasks.filter(
    (task) =>
      !isValidCoordinate(
        task.latitude,
        task.longitude
      )
  ).length;

  // ====================================================
  // COUNTS
  // ====================================================

  const totalPickup = tasks.filter(
    (task) => task.type === "pickup"
  ).length;

  const totalDelivery = tasks.filter(
    (task) => task.type === "delivery"
  ).length;

  // ====================================================
  // DELIVERY ACTIONS
  // ====================================================

  function changeDeliveryStatus(
    taskId: string,
    nextStatus: "shipped" | "completed"
  ) {
    if (pending) return;

    if (
      nextStatus === "completed" &&
      !window.confirm(
        "Pastikan pesanan sudah diterima pelanggan. Selesaikan pengiriman ini?"
      )
    ) {
      return;
    }

    const orderId = taskId.replace(
      /^delivery-/,
      ""
    );

    setNotice("");

    startTransition(async () => {
      const result =
        await updateCourierDeliveryStatus(
          orderId,
          nextStatus
        );

      setNotice(result.message);
      setNoticeSuccess(result.success);

      if (result.success) {
        router.refresh();
      }
    });
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="space-y-6">
      {/* NOTIFICATION */}
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-bold ${
            noticeSuccess
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {noticeSuccess ? (
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
          ) : (
            <AlertTriangle
              size={20}
              className="shrink-0"
            />
          )}

          <span className="flex-1">{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-xs underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* SUMMARY FILTER CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => {
            setFilter("all");
            setSelectedId(null);
          }}
          className={`rounded-[24px] border p-5 text-left transition ${
            filter === "all"
              ? "border-[#47763A] bg-[#47763A] text-white shadow-lg"
              : "border-[#EAE3D6] bg-white text-[#332417] hover:border-[#47763A]"
          }`}
        >
          <div className="flex items-center justify-between">
            <ClipboardList size={25} />

            <ArrowUpRight size={18} />
          </div>

          <p className="mt-5 text-3xl font-black">
            {tasks.length}
          </p>

          <p className="mt-1 text-sm font-bold">
            Semua Tugas
          </p>

          <p
            className={`mt-1 text-xs ${
              filter === "all"
                ? "text-white/75"
                : "text-[#8C7A65]"
            }`}
          >
            Penjemputan dan pengantaran
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilter("pickup");
            setSelectedId(null);
          }}
          className={`rounded-[24px] border p-5 text-left transition ${
            filter === "pickup"
              ? "border-[#47763A] bg-[#47763A] text-white shadow-lg"
              : "border-[#EAE3D6] bg-white text-[#332417] hover:border-[#47763A]"
          }`}
        >
          <div className="flex items-center justify-between">
            <Leaf size={25} />

            <ArrowUpRight size={18} />
          </div>

          <p className="mt-5 text-3xl font-black">
            {totalPickup}
          </p>

          <p className="mt-1 text-sm font-bold">
            Penjemputan
          </p>

          <p
            className={`mt-1 text-xs ${
              filter === "pickup"
                ? "text-white/75"
                : "text-[#8C7A65]"
            }`}
          >
            Pengambilan sampah organik
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilter("delivery");
            setSelectedId(null);
          }}
          className={`rounded-[24px] border p-5 text-left transition ${
            filter === "delivery"
              ? "border-[#47763A] bg-[#47763A] text-white shadow-lg"
              : "border-[#EAE3D6] bg-white text-[#332417] hover:border-[#47763A]"
          }`}
        >
          <div className="flex items-center justify-between">
            <Truck size={25} />

            <ArrowUpRight size={18} />
          </div>

          <p className="mt-5 text-3xl font-black">
            {totalDelivery}
          </p>

          <p className="mt-1 text-sm font-bold">
            Pengantaran
          </p>

          <p
            className={`mt-1 text-xs ${
              filter === "delivery"
                ? "text-white/75"
                : "text-[#8C7A65]"
            }`}
          >
            Pengiriman produk Marketplace
          </p>
        </button>
      </div>

      {/* MAP */}
      <section className="overflow-hidden rounded-[28px] border border-[#EAE3D6] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E9DE] p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <MapPinned
                size={21}
                className="text-[#47763A]"
              />

              <h2 className="text-lg font-black text-[#332417]">
                Peta Lokasi Tugas
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#8C7A65]">
              Lokasi penjemputan dan pengantaran
              yang ditugaskan kepada Anda.
            </p>
          </div>

          <span className="rounded-full bg-[#EFF5E9] px-4 py-2 text-xs font-black text-[#47763A]">
            {locations.length} Lokasi Terpetakan
          </span>
        </div>

        <div className="p-3 sm:p-5">
          <div className="overflow-hidden rounded-2xl">
            <OperationalMap
              locations={locations}
              selectedId={selectedId}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 px-5 pb-5 text-xs font-bold text-[#776957]">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#47763A]" />
            Penjemputan
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FFDA57]" />
            Pengantaran
          </span>
        </div>
      </section>

      {/* MISSING COORDINATES */}
      {missingCoordinates > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="text-sm font-black text-amber-900">
              Beberapa lokasi belum tersedia
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              {missingCoordinates} tugas belum
              memiliki koordinat yang valid.
              Tugas tetap ditampilkan dalam daftar,
              tetapi belum dapat ditunjukkan pada peta.
            </p>
          </div>
        </div>
      )}

      {/* TASK LIST */}
      <section className="rounded-[28px] border border-[#EAE3D6] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#332417]">
              Daftar Tugas Operasional
            </h2>

            <p className="mt-1 text-sm text-[#8C7A65]">
              Pilih tugas untuk melihat lokasi
              atau memulai pengiriman.
            </p>
          </div>

          <span className="rounded-full bg-[#FFFBF1] px-4 py-2 text-xs font-black text-[#47763A]">
            {filteredTasks.length} Tugas
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAE3D6] bg-[#FFFBF1] px-5 py-16 text-center">
            <PackageCheck
              size={45}
              className="text-[#47763A]"
            />

            <h3 className="mt-4 text-lg font-black text-[#332417]">
              Belum Ada Tugas
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#8C7A65]">
              Belum ada tugas operasional untuk
              kategori ini. Tugas baru akan muncul
              setelah ditugaskan oleh Admin.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredTasks.map((task) => {
              const hasLocation =
                isValidCoordinate(
                  task.latitude,
                  task.longitude
                );

              const isSelected =
                selectedId === task.id;

              return (
                <article
                  key={task.id}
                  className={`rounded-[24px] border p-5 transition ${
                    isSelected
                      ? "border-[#47763A] bg-[#F7FAF2] shadow-md"
                      : "border-[#EAE3D6] bg-[#FFFEFB] hover:border-[#B7C9AD]"
                  }`}
                >
                  {/* TASK HEADER */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          task.type === "pickup"
                            ? "bg-[#E8F1E3] text-[#47763A]"
                            : "bg-[#FFF0B5] text-[#866500]"
                        }`}
                      >
                        {task.type === "pickup" ? (
                          <Leaf size={23} />
                        ) : (
                          <Truck size={23} />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#8C7A65]">
                          {task.type === "pickup"
                            ? "Penjemputan"
                            : "Pengantaran"}
                        </p>

                        <h3 className="mt-1 text-base font-black leading-6 text-[#332417]">
                          {task.title}
                        </h3>

                        <p className="mt-1 text-sm text-[#8C7A65]">
                          {task.subtitle}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${getStatusClass(
                        task.status
                      )}`}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </div>

                  {/* TASK INFORMATION */}
                  <div className="mt-5 space-y-3 border-t border-[#EAE3D6] pt-4">
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-[#47763A]"
                      />

                      <div>
                        <p className="text-xs font-bold text-[#8C7A65]">
                          Alamat Tujuan
                        </p>

                        <p className="mt-1 text-sm font-semibold leading-6 text-[#332417]">
                          {task.address ||
                            "Alamat belum tersedia"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3
                        size={18}
                        className="mt-0.5 shrink-0 text-[#47763A]"
                      />

                      <div>
                        <p className="text-xs font-bold text-[#8C7A65]">
                          {task.type === "pickup"
                            ? "Jadwal Penjemputan"
                            : "Tanggal Pesanan"}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#332417]">
                          {formatDate(
                            task.scheduledAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ClipboardList
                        size={18}
                        className="mt-0.5 shrink-0 text-[#47763A]"
                      />

                      <p className="text-sm font-semibold leading-6 text-[#332417]">
                        {task.detail}
                      </p>
                    </div>
                  </div>

                  {/* MAP BUTTONS */}
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={!hasLocation}
                      onClick={() =>
                        setSelectedId(task.id)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#47763A] px-4 py-3 text-sm font-black text-[#47763A] transition hover:bg-[#EFF5E9] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MapPinned size={17} />
                      Lihat di Peta
                    </button>

                    {hasLocation ? (
                      <a
                        href={getGoogleMapsUrl(
                          Number(task.latitude),
                          Number(task.longitude)
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#332417] px-4 py-3 text-sm font-black text-white transition hover:bg-[#4B3928]"
                      >
                        <Navigation size={17} />
                        Buka Rute
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EAE3D6] px-4 py-3 text-sm font-black text-[#9A8974]"
                      >
                        <Navigation size={17} />
                        Rute Belum Tersedia
                      </button>
                    )}
                  </div>

                  {/* DELIVERY ACTIONS */}
                  {task.type === "delivery" &&
                    task.status === "processing" && (
                      <button
                        type="button"
                        disabled={
                          pending || !hasLocation
                        }
                        onClick={() =>
                          changeDeliveryStatus(
                            task.id,
                            "shipped"
                          )
                        }
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#47763A] px-4 py-3.5 text-sm font-black text-white transition hover:bg-[#315F2E] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pending ? (
                          <>
                            <RefreshCw
                              size={17}
                              className="animate-spin"
                            />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <Truck size={18} />
                            Mulai Pengiriman
                          </>
                        )}
                      </button>
                    )}

                  {task.type === "delivery" &&
                    task.status === "shipped" && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          changeDeliveryStatus(
                            task.id,
                            "completed"
                          )
                        }
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFDA57] px-4 py-3.5 text-sm font-black text-[#332417] transition hover:bg-[#F1CB43] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pending ? (
                          <>
                            <RefreshCw
                              size={17}
                              className="animate-spin"
                            />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            Selesaikan Pengiriman
                          </>
                        )}
                      </button>
                    )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER INFORMATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#EAF1E4] p-4 text-sm text-[#47763A]">
        <div className="flex items-center gap-2">
          <MapPin size={18} />

          <p className="font-semibold">
            Peta menggunakan OpenStreetMap.
            Navigasi rute dibuka melalui Google Maps.
          </p>
        </div>

        <span className="text-xs font-black">
          PUTARASA COURIER
        </span>
      </div>
    </div>
  );
}
